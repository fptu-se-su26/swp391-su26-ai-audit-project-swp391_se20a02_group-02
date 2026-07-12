package com.luxeway.service;

import com.luxeway.dto.admin.AdminDTOs;
import com.luxeway.dto.user.UserDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.entity.UserDocument;
import com.luxeway.enums.UserRole;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private UserService userService;
    @Mock private VehicleService vehicleService;
    @Mock private BookingService bookingService;
    @Mock private PaymentService paymentService;
    @Mock private DisputeRepository disputeRepository;
    @Mock private UserDocumentRepository userDocumentRepository;
    @Mock private AnalyticsRepository analyticsRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private AdminService adminService;

    // ====== Dashboard Statistics ======
    @Test
    void testGetDashboardStats() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRoleAndIsActiveTrue(UserRole.CUSTOMER)).thenReturn(5L);
        when(userRepository.countByRoleAndIsActiveTrue(UserRole.OWNER)).thenReturn(3L);
        when(userRepository.countByRoleAndIsActiveTrue(UserRole.ADMIN)).thenReturn(2L);
        when(userRepository.countVerifiedUsers()).thenReturn(7L);

        when(vehicleRepository.count()).thenReturn(20L);
        when(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE)).thenReturn(10L);
        when(vehicleRepository.countByStatus(VehicleStatus.PENDING_APPROVAL)).thenReturn(5L);

        when(bookingRepository.count()).thenReturn(50L);
        when(bookingRepository.countByStatus(any())).thenReturn(10L);
        when(bookingRepository.sumTotalRevenue()).thenReturn(new BigDecimal("1000.50"));

        AdminDTOs.DashboardStatsResponse stats = adminService.getDashboardStats();

        assertEquals(10L, stats.getTotalUsers());
        assertEquals(5L, stats.getTotalCustomers());
        assertEquals(new BigDecimal("1000.50"), stats.getTotalRevenue());
        verify(userRepository, times(1)).count();
        verify(bookingRepository, times(1)).sumTotalRevenue();
    }

    // ====== User Management ======
    @Test
    void testUpdateUserStatus_Valid() {
        User user = User.builder().id("u1").isActive(false).verified(false).kycVerified(false).build();

        AdminDTOs.UpdateUserStatusRequest req = mock(AdminDTOs.UpdateUserStatusRequest.class);
        when(req.isActive()).thenReturn(true);
        when(req.isVerified()).thenReturn(true);
        when(req.isKycVerified()).thenReturn(true);

        UserDTOs.UserProfileResponse mockRes = new UserDTOs.UserProfileResponse();
        
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userService.toProfileResponse(user)).thenReturn(mockRes);

        UserDTOs.UserProfileResponse res = adminService.updateUserStatus("u1", req);

        assertNotNull(res);
        verify(userRepository).save(user);
        assertTrue(user.getIsActive());
        assertTrue(user.getVerified());
        assertTrue(user.getKycVerified());
    }

    @Test
    void testUpdateUserStatus_NotFound() {
        when(userRepository.findById("invalid")).thenReturn(Optional.empty());
        AdminDTOs.UpdateUserStatusRequest req = mock(AdminDTOs.UpdateUserStatusRequest.class);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> adminService.updateUserStatus("invalid", req));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void testListUsers_WithKeyword() {
        Page<User> page = new PageImpl<>(List.of(new User()));
        when(userRepository.searchUsers(eq("John"), any(Pageable.class))).thenReturn(page);
        
        adminService.listUsers(null, "John", 0, 10);
        verify(userRepository).searchUsers(eq("John"), any(Pageable.class));
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    void testListUsers_WithValidRole() {
        Page<User> page = new PageImpl<>(List.of(new User()));
        when(userRepository.findByRole(eq(UserRole.ADMIN), any(Pageable.class))).thenReturn(page);
        
        adminService.listUsers("ADMIN", null, 0, 10);
        verify(userRepository).findByRole(eq(UserRole.ADMIN), any(Pageable.class));
    }

    @Test
    void testListUsers_WithInvalidRole() {
        Page<User> page = new PageImpl<>(List.of(new User()));
        when(userRepository.findAll(any(Pageable.class))).thenReturn(page);
        
        adminService.listUsers("INVALID_ROLE", null, 0, 10);
        verify(userRepository).findAll(any(Pageable.class));
    }

    // ====== Vehicle Management ======
    @Test
    void testApproveVehicle_Valid() {
        User owner = User.builder().email("test@test.com").build();
        Vehicle v = Vehicle.builder().id("v1").owner(owner).status(VehicleStatus.PENDING_APPROVAL).build();

        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(v));
        when(vehicleRepository.save(v)).thenReturn(v);

        adminService.approveVehicle("v1");

        assertEquals(VehicleStatus.AVAILABLE, v.getStatus());
        assertTrue(v.getIsVerified());
        verify(emailService).sendVehicleApprovalStatus(eq("test@test.com"), eq(v), eq("AVAILABLE"), isNull());
    }

    @Test
    void testRejectVehicle_Valid() {
        User owner = User.builder().email("test@test.com").build();
        Vehicle v = Vehicle.builder().id("v1").owner(owner).status(VehicleStatus.PENDING_APPROVAL).build();

        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(v));
        when(vehicleRepository.save(v)).thenReturn(v);

        adminService.rejectVehicle("v1", "Bad quality");

        assertEquals(VehicleStatus.REJECTED, v.getStatus());
        verify(emailService).sendVehicleApprovalStatus(eq("test@test.com"), eq(v), eq("REJECTED"), eq("Bad quality"));
    }

    // ====== Dispute & Document Management ======
    @Test
    void testReviewDocument_InvalidStatus() {
        UserDocument doc = UserDocument.builder().id("d1").build();
        when(userDocumentRepository.findById("d1")).thenReturn(Optional.of(doc));
        AdminDTOs.ReviewDocumentRequest req = mock(AdminDTOs.ReviewDocumentRequest.class);
        when(req.getStatus()).thenReturn("PENDING");
        
        assertThrows(IllegalArgumentException.class, () -> adminService.reviewDocument("d1", req));
    }

    @Test
    void testReviewDocument_Verified_DrivingLicense() {
        User user = User.builder().email("user@test.com").kycVerified(true).drivingLicenseVerified(false).build();
        UserDocument doc = UserDocument.builder().id("d1").documentType("DRIVING_LICENSE").user(user).build();

        when(userDocumentRepository.findById("d1")).thenReturn(Optional.of(doc));
        when(userDocumentRepository.save(any(UserDocument.class))).thenAnswer(i -> i.getArgument(0));

        AdminDTOs.ReviewDocumentRequest req = mock(AdminDTOs.ReviewDocumentRequest.class);
        when(req.getStatus()).thenReturn("VERIFIED");
        
        adminService.reviewDocument("d1", req);

        assertTrue(user.getDrivingLicenseVerified());
        assertTrue(user.getVerified()); // Both KYC and Driving are true
        verify(emailService).sendKycStatus(eq("user@test.com"), eq("DRIVING_LICENSE"), eq("VERIFIED"), isNull());
    }

    // ====== Payment Management ======
    @Test
    void testProcessRefund() {
        AdminDTOs.RefundPaymentRequest req = mock(AdminDTOs.RefundPaymentRequest.class);
        when(req.getRefundAmount()).thenReturn(new BigDecimal("50.0"));
        adminService.processRefund("pay1", req, "admin1");
        verify(paymentService).refundPayment("pay1", new BigDecimal("50.0"), "admin1");
    }

    @Test
    void testListPendingVehicles() {
        Page<Vehicle> page = new PageImpl<>(List.of(new Vehicle()));
        when(vehicleRepository.findByStatusOrderByCreatedAtDesc(eq(VehicleStatus.PENDING_APPROVAL), any(Pageable.class))).thenReturn(page);
        adminService.listPendingVehicles(0, 10);
        verify(vehicleRepository).findByStatusOrderByCreatedAtDesc(eq(VehicleStatus.PENDING_APPROVAL), any(Pageable.class));
    }

    @Test
    void testListAllVehicles() {
        Page<Vehicle> page = new PageImpl<>(List.of(new Vehicle()));
        when(vehicleRepository.findByStatus(eq(VehicleStatus.AVAILABLE), any(Pageable.class))).thenReturn(page);
        adminService.listAllVehicles("AVAILABLE", 0, 10);
        verify(vehicleRepository).findByStatus(eq(VehicleStatus.AVAILABLE), any(Pageable.class));
    }

    @Test
    void testListAllBookings() {
        Page<com.luxeway.entity.Booking> page = new PageImpl<>(List.of(new com.luxeway.entity.Booking()));
        when(bookingRepository.findByStatus(eq(com.luxeway.enums.BookingStatus.COMPLETED), any(Pageable.class))).thenReturn(page);
        adminService.listAllBookings("COMPLETED", 0, 10);
        verify(bookingRepository).findByStatus(eq(com.luxeway.enums.BookingStatus.COMPLETED), any(Pageable.class));
    }

    @Test
    void testListAllPayments() {
        Page<com.luxeway.entity.Payment> page = new PageImpl<>(List.of(new com.luxeway.entity.Payment()));
        when(paymentRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class))).thenReturn(page);
        adminService.listAllPayments(0, 10);
        verify(paymentRepository).findAllByOrderByCreatedAtDesc(any(Pageable.class));
    }

    @Test
    void testListAllDisputes() {
        when(disputeRepository.findAll(any(org.springframework.data.domain.Sort.class))).thenReturn(List.of());
        adminService.listAllDisputes();
        verify(disputeRepository).findAll(any(org.springframework.data.domain.Sort.class));
    }

    @Test
    void testExportRevenueReportPdf() throws Exception {
        when(bookingRepository.findAll()).thenReturn(List.of());
        byte[] pdf = adminService.exportRevenueReportPdf();
        assertNotNull(pdf);
    }

    @Test
    void testExportRevenueReportExcel() throws Exception {
        when(analyticsRepository.findAll()).thenReturn(List.of());
        byte[] excel = adminService.exportRevenueReportExcel();
        assertNotNull(excel);
    }
}
