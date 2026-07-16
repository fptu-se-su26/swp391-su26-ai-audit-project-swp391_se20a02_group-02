package com.luxeway.security;

import com.luxeway.entity.*;
import com.luxeway.enums.*;
import com.luxeway.repository.*;
import com.luxeway.service.BookingService;
import com.luxeway.dto.booking.BookingDTOs;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({"h2", "dev"})
@Transactional
@SuppressWarnings("all")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    private User adminUser;
    private User ownerUser1;
    private User ownerUser2;
    private User customerUser1;
    private User customerUser2;

    @BeforeEach
    public void setUp() {
        // Create standard test users
        adminUser = createTestUser("admin@luxeway.com", UserRole.ADMIN, true, true);
        ownerUser1 = createTestUser("owner1@luxeway.com", UserRole.OWNER, true, true);
        ownerUser2 = createTestUser("owner2@luxeway.com", UserRole.OWNER, true, true);
        customerUser1 = createTestUser("customer1@luxeway.com", UserRole.CUSTOMER, true, true);
        customerUser2 = createTestUser("customer2@luxeway.com", UserRole.CUSTOMER, true, true);
    }

    private User createTestUser(String email, UserRole role, boolean kyc, boolean driving) {
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .password("password123")
                .firstName("Test")
                .lastName(role.name())
                .role(role)
                .verified(true)
                .isActive(true)
                .kycVerified(kyc)
                .kycStatus(kyc ? "VERIFIED" : "NOT_UPLOADED")
                .drivingLicenseVerified(driving)
                .licenseClass(driving ? "B" : "")
                .walletBalance(BigDecimal.ZERO)
                .build();
        return userRepository.save(user);
    }

    private MockHttpServletRequestBuilder addAuth(MockHttpServletRequestBuilder builder, User user) {
        String token = jwtTokenProvider.generateToken(user);
        return builder.header("Authorization", "Bearer " + token);
    }

    // ====== 1. Admin Route Protection Tests ======

    @Test
    public void testAdminEndpointsRestricted() throws Exception {
        // GET /users restricted to ADMIN
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnauthorized()); // Unauthenticated

        mockMvc.perform(addAuth(get("/api/v1/users"), customerUser1))
                .andExpect(status().isForbidden()); // Customer forbidden

        mockMvc.perform(addAuth(get("/api/v1/users"), adminUser))
                .andExpect(status().isOk()); // Admin OK

        // GET /test/health restricted to ADMIN
        mockMvc.perform(get("/api/v1/test/health"))
                .andExpect(status().isUnauthorized()); // Unauthenticated

        mockMvc.perform(addAuth(get("/api/v1/test/health"), customerUser1))
                .andExpect(status().isForbidden()); // Customer forbidden

        mockMvc.perform(addAuth(get("/api/v1/test/health"), adminUser))
                .andExpect(status().isOk()); // Admin OK

        // GET /admin/dashboard restricted to ADMIN
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(addAuth(get("/api/v1/admin/dashboard"), customerUser1))
                .andExpect(status().isForbidden());

        mockMvc.perform(addAuth(get("/api/v1/admin/dashboard"), adminUser))
                .andExpect(status().isOk());
    }

    // ====== 2. Upload Authentication & File Validation Tests ======

    @Test
    public void testUploadEndpointsAuthenticationAndValidation() throws Exception {
        // Unauthenticated upload denied
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "test.pdf", MediaType.APPLICATION_PDF_VALUE,
                "%PDF-1.4 mock content".getBytes(StandardCharsets.US_ASCII)
        );

        mockMvc.perform(multipart("/api/v1/upload").file(mockFile))
                .andExpect(status().isUnauthorized());

        // Authenticated customer upload allowed (returns 200)
        mockMvc.perform(addAuth(multipart("/api/v1/upload").file(mockFile), customerUser1))
                .andExpect(status().isOk());

        // Executable/illegal upload denied by Tika magic check (returns 400 Bad Request)
        MockMultipartFile executableFile = new MockMultipartFile(
                "file", "malicious.exe", "application/x-msdownload",
                "MZ\u0090\u0000\u0003\u0000\u0000\u0000".getBytes(StandardCharsets.US_ASCII) // MZ header for exe
        );
        mockMvc.perform(addAuth(multipart("/api/v1/upload").file(executableFile), customerUser1))
                .andExpect(status().isBadRequest());
    }

    // ====== 3. Invoice Security (BOLA/IDOR) Tests ======

    @Test
    public void testInvoiceBolaProtection() throws Exception {
        // Create booking details
        Vehicle vehicle = createTestVehicle(ownerUser1);
        Booking booking = createTestBooking(vehicle, customerUser1, ownerUser1);

        Invoice invoice = Invoice.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .user(customerUser1)
                .invoiceNumber("INV-" + System.currentTimeMillis())
                .amount(BigDecimal.valueOf(3500000))
                .taxAmount(BigDecimal.valueOf(200000))
                .status("PAID")
                .build();
        invoice = invoiceRepository.save(invoice);

        String invoiceUrl = "/api/v1/invoices/" + invoice.getId();
        String downloadUrl = "/api/v1/invoices/download/" + invoice.getId();

        // 1. Renter (customerUser1) should be allowed
        mockMvc.perform(addAuth(get(invoiceUrl), customerUser1))
                .andExpect(status().isOk());
        mockMvc.perform(addAuth(get(downloadUrl), customerUser1))
                .andExpect(status().isOk());

        // 2. Owner (ownerUser1) should be allowed
        mockMvc.perform(addAuth(get(invoiceUrl), ownerUser1))
                .andExpect(status().isOk());
        mockMvc.perform(addAuth(get(downloadUrl), ownerUser1))
                .andExpect(status().isOk());

        // 3. Admin should be allowed
        mockMvc.perform(addAuth(get(invoiceUrl), adminUser))
                .andExpect(status().isOk());
        mockMvc.perform(addAuth(get(downloadUrl), adminUser))
                .andExpect(status().isOk());

        // 4. Other customer (customerUser2) should be forbidden
        mockMvc.perform(addAuth(get(invoiceUrl), customerUser2))
                .andExpect(status().isForbidden());
        mockMvc.perform(addAuth(get(downloadUrl), customerUser2))
                .andExpect(status().isForbidden());
    }

    // ====== 4. Digital Contract Security (BOLA/IDOR) Tests ======

    @Test
    public void testDigitalContractBolaProtection() throws Exception {
        Vehicle vehicle = createTestVehicle(ownerUser1);
        Booking booking = createTestBooking(vehicle, customerUser1, ownerUser1);

        String contractUrl = "/api/v1/contracts/booking/" + booking.getId();

        // Initially no contract exists
        mockMvc.perform(addAuth(get(contractUrl), customerUser1))
                .andExpect(status().isNotFound());

        // Attempt creation of contract by unauthorized customer (customerUser2)
        Map<String, String> payload = Map.of(
                "bookingId", booking.getId(),
                "documentUrl", "http://example.com/contract.pdf"
        );
        mockMvc.perform(addAuth(post("/api/v1/contracts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)), customerUser2))
                .andExpect(status().isForbidden());

        // Allowed to create by renter (customerUser1)
        mockMvc.perform(addAuth(post("/api/v1/contracts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)), customerUser1))
                .andExpect(status().isOk());

        // Verify viewing permissions
        // Renter (customerUser1) OK
        mockMvc.perform(addAuth(get(contractUrl), customerUser1))
                .andExpect(status().isOk());

        // Owner (ownerUser1) OK
        mockMvc.perform(addAuth(get(contractUrl), ownerUser1))
                .andExpect(status().isOk());

        // Admin OK
        mockMvc.perform(addAuth(get(contractUrl), adminUser))
                .andExpect(status().isOk());

        // Other customer (customerUser2) forbidden
        mockMvc.perform(addAuth(get(contractUrl), customerUser2))
                .andExpect(status().isForbidden());
    }

    // ====== 5. Employee Security & Ownership Isolation Tests ======

    @Test
    public void testEmployeeSecurityAndOwnershipIsolation() throws Exception {
        // Customer cannot access employee routes
        mockMvc.perform(addAuth(get("/api/v1/employees"), customerUser1))
                .andExpect(status().isForbidden());

        // Owner 1 creates employee
        Employee employee = Employee.builder()
                .id(UUID.randomUUID().toString())
                .name("Driver John")
                .email("john@example.com")
                .phone("0987654321")
                .role("DRIVER")
                .owner(ownerUser1)
                .build();
        employee = employeeRepository.save(employee);

        String empUrl = "/api/v1/employees/" + employee.getId();

        // Owner 1 can view employee details
        mockMvc.perform(addAuth(get(empUrl), ownerUser1))
                .andExpect(status().isOk());

        // Owner 2 cannot view Owner 1's employee details
        mockMvc.perform(addAuth(get(empUrl), ownerUser2))
                .andExpect(status().isForbidden());

        // Owner 2 cannot update Owner 1's employee
        employee.setName("Hacked Driver");
        mockMvc.perform(addAuth(put(empUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employee)), ownerUser2))
                .andExpect(status().isForbidden());

        // Owner 2 cannot delete Owner 1's employee
        mockMvc.perform(addAuth(delete(empUrl), ownerUser2))
                .andExpect(status().isForbidden());

        // Admin can update or delete
        mockMvc.perform(addAuth(get(empUrl), adminUser))
                .andExpect(status().isOk());
    }

    // ====== 6. Booking KYC Enforcement Tests ======

    @Test
    public void testBookingKycEnforcement() {
        // Create verified and unverified customers
        User unverifiedCustomer = createTestUser("unverified@luxeway.com", UserRole.CUSTOMER, false, false);
        User partiallyVerifiedCustomer = createTestUser("partial@luxeway.com", UserRole.CUSTOMER, true, false);
        User fullyVerifiedCustomer = createTestUser("fully@luxeway.com", UserRole.CUSTOMER, true, true);

        Vehicle vehicle = createTestVehicle(ownerUser1);

        BookingDTOs.CreateBookingRequest req = new BookingDTOs.CreateBookingRequest();
        req.setVehicleId(vehicle.getId());
        req.setStartDate(LocalDate.now().plusDays(5));
        req.setEndDate(LocalDate.now().plusDays(10));
        req.setIncludeInsurance(false);
        req.setIncludeDelivery(false);

        // 1. Unverified customer should be blocked
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(unverifiedCustomer.getId(), req);
        }, "Should throw exception due to missing KYC");

        // 2. Partially verified customer should be blocked
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(partiallyVerifiedCustomer.getId(), req);
        }, "Should throw exception due to missing driving license verification");

        // 3. Fully verified customer should succeed
        assertDoesNotThrow(() -> {
            bookingService.createBooking(fullyVerifiedCustomer.getId(), req);
        });
    }

    // ====== Helpers for Creating Domain Objects ======

    private Vehicle createTestVehicle(User owner) {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID().toString())
                .owner(owner)
                .name("VinFast VF8")
                .brand("VinFast")
                .model("VF8")
                .year(2023)
                .category(VehicleCategory.SUV)
                .pricePerDay(BigDecimal.valueOf(1200000))
                .deposit(BigDecimal.valueOf(5000000))
                .city("Da Nang")
                .seats(5)
                .transmission(TransmissionType.AUTOMATIC)
                .fuelType(FuelType.ELECTRIC)
                .status(VehicleStatus.AVAILABLE)
                .build();
        return vehicleRepository.save(vehicle);
    }

    private Booking createTestBooking(Vehicle vehicle, User renter, User owner) {
        Booking booking = Booking.builder()
                .id(UUID.randomUUID().toString())
                .vehicle(vehicle)
                .renter(renter)
                .owner(owner)
                .status(BookingStatus.CONFIRMED)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .totalDays(3)
                .basePrice(BigDecimal.valueOf(3600000))
                .pricePerDay(BigDecimal.valueOf(1200000))
                .serviceFee(BigDecimal.valueOf(360000))
                .taxes(BigDecimal.valueOf(240000))
                .total(BigDecimal.valueOf(4200000))
                .deposit(BigDecimal.valueOf(5000000))
                .build();
        return bookingRepository.save(booking);
    }
}
