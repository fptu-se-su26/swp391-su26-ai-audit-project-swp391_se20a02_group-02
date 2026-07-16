package com.luxeway.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeway.dto.admin.AdminDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.entity.Notification;
import com.luxeway.enums.UserRole;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.FuelType;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(properties = "spring.main.allow-bean-definition-overriding=true")
@AutoConfigureMockMvc
@ActiveProfiles({"h2", "dev"})
@Transactional
@SuppressWarnings("all")
public class VehicleWorkflowIntegrationTest {

    @org.springframework.boot.test.context.TestConfiguration
    static class TestConfig {
        @org.springframework.context.annotation.Bean("taskExecutor")
        @org.springframework.context.annotation.Primary
        public java.util.concurrent.Executor taskExecutor() {
            return new org.springframework.core.task.SyncTaskExecutor();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private User adminUser;
    private User ownerUser;
    private User customerUser;

    @BeforeEach
    public void setUp() {
        // Create standard test users
        adminUser = createTestUser("admin@workflow.com", UserRole.ADMIN);
        ownerUser = createTestUser("owner@workflow.com", UserRole.OWNER);
        customerUser = createTestUser("customer@workflow.com", UserRole.CUSTOMER);
    }

    private User createTestUser(String email, UserRole role) {
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .password("password123")
                .firstName("Test")
                .lastName(role.name())
                .role(role)
                .verified(true)
                .isActive(true)
                .kycVerified(true)
                .drivingLicenseVerified(true)
                .walletBalance(BigDecimal.ZERO)
                .build();
        return userRepository.save(user);
    }

    private MockHttpServletRequestBuilder addAuth(MockHttpServletRequestBuilder builder, User user) {
        String token = jwtTokenProvider.generateToken(user);
        return builder.header("Authorization", "Bearer " + token);
    }

    private VehicleDTOs.CreateVehicleRequest buildValidCreateRequest(String licensePlate) {
        VehicleDTOs.CreateVehicleRequest req = new VehicleDTOs.CreateVehicleRequest();
        req.setName("VinFast VF8 Lux");
        req.setBrand("VinFast");
        req.setModel("VF8");
        req.setYear(2024);
        req.setCategory(VehicleCategory.SUV);
        req.setPricePerDay(BigDecimal.valueOf(1200000));
        req.setDeposit(BigDecimal.valueOf(5000000));
        req.setCity("Da Nang");
        req.setSeats(5);
        req.setTransmission(TransmissionType.AUTOMATIC);
        req.setFuelType(FuelType.ELECTRIC);
        req.setVehicleType("CAR");
        req.setLicensePlate(licensePlate);
        req.setImageUrls(List.of("http://example.com/vf8_1.jpg", "http://example.com/vf8_2.jpg", "http://example.com/vf8_3.jpg"));
        req.setFeatures(List.of("GPS", "Sunroof"));
        return req;
    }

    // Test 1: Owner creates vehicle -> state is PENDING_APPROVAL.
    @Test
    public void testOwnerCreatesVehiclePendingApproval() throws Exception {
        VehicleDTOs.CreateVehicleRequest req = buildValidCreateRequest("43A-Workflow1");

        String responseContent = mockMvc.perform(addAuth(post("/api/v1/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicle.status").value("pending_approval"))
                .andExpect(jsonPath("$.vehicle.approvalStatus").value("pending_approval"))
                .andReturn().getResponse().getContentAsString();

        // Verify it exists in the repository in PENDING_APPROVAL status
        String vehicleId = objectMapper.readTree(responseContent).path("vehicle").path("id").asText();
        assertNotNull(vehicleId);
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        assertNotNull(vehicle);
        assertEquals(VehicleStatus.PENDING_APPROVAL, vehicle.getStatus());
        assertEquals(VehicleStatus.PENDING_APPROVAL, vehicle.getApprovalStatus());

        // Check that a notification of type VEHICLE_APPROVAL was created for the admin
        List<Notification> adminNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(adminUser.getId(), PageRequest.of(0, 10)).getContent();
        boolean foundApprovalNotification = adminNotifications.stream()
                .anyMatch(n -> "VEHICLE_APPROVAL".equals(n.getType()) && n.getLink().contains(vehicleId));
        assertTrue(foundApprovalNotification, "Admin should receive a VEHICLE_APPROVAL notification");
    }

    // Test 2: Customer search -> vehicle is not visible.
    @Test
    public void testCustomerSearchDoesNotSeePendingVehicle() throws Exception {
        VehicleDTOs.CreateVehicleRequest req = buildValidCreateRequest("43A-Workflow2");
        
        // Owner creates vehicle
        String responseContent = mockMvc.perform(addAuth(post("/api/v1/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String vehicleId = objectMapper.readTree(responseContent).path("vehicle").path("id").asText();

        // Customer searches/lists vehicles
        mockMvc.perform(addAuth(get("/api/v1/vehicles"), customerUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicles.length()").value(0)); // Should be empty since none are APPROVED + AVAILABLE

        // Basic keyword search
        mockMvc.perform(addAuth(get("/api/v1/vehicles/search?keyword=VinFast"), customerUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicles.length()").value(0));
    }

    // Test 3: Admin approves -> vehicle is visible to customers.
    @Test
    public void testAdminApprovesVehicleIsVisible() throws Exception {
        VehicleDTOs.CreateVehicleRequest req = buildValidCreateRequest("43A-Workflow3");
        
        // Owner creates vehicle
        String createResponse = mockMvc.perform(addAuth(post("/api/v1/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String vehicleId = objectMapper.readTree(createResponse).path("vehicle").path("id").asText();

        // Admin approves vehicle
        mockMvc.perform(addAuth(put("/api/v1/admin/vehicles/" + vehicleId + "/approve"), adminUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("available"))
                .andExpect(jsonPath("$.data.approvalStatus").value("approved"));

        // Verify status in DB
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        assertNotNull(vehicle);
        assertEquals(VehicleStatus.AVAILABLE, vehicle.getStatus());
        assertEquals(VehicleStatus.APPROVED, vehicle.getApprovalStatus());

        // Check owner received approval notification
        List<Notification> ownerNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(ownerUser.getId(), PageRequest.of(0, 10)).getContent();
        boolean foundApprovedNotification = ownerNotifications.stream()
                .anyMatch(n -> "VEHICLE_APPROVED".equals(n.getType()));
        assertTrue(foundApprovedNotification, "Owner should receive a VEHICLE_APPROVED notification");

        // Customer searches/lists vehicles -> vehicle should now be visible
        mockMvc.perform(addAuth(get("/api/v1/vehicles"), customerUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicles.length()").value(1))
                .andExpect(jsonPath("$.vehicles[0].id").value(vehicleId));
    }

    // Test 4: Admin rejects -> owner notified and receives the reason.
    @Test
    public void testAdminRejectsVehicleOwnerNotifiedWithReason() throws Exception {
        VehicleDTOs.CreateVehicleRequest req = buildValidCreateRequest("43A-Workflow4");
        
        // Owner creates vehicle
        String createResponse = mockMvc.perform(addAuth(post("/api/v1/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String vehicleId = objectMapper.readTree(createResponse).path("vehicle").path("id").asText();

        // Admin rejects vehicle
        AdminDTOs.ApproveVehicleRequest rejectReq = new AdminDTOs.ApproveVehicleRequest();
        rejectReq.setApproved(false);
        rejectReq.setReason("Incorrect engine specs matching the model");

        mockMvc.perform(addAuth(put("/api/v1/admin/vehicles/" + vehicleId + "/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rejectReq)), adminUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("rejected"))
                .andExpect(jsonPath("$.data.approvalStatus").value("rejected"))
                .andExpect(jsonPath("$.data.approvalNote").value("Incorrect engine specs matching the model"));

        // Verify status in DB
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        assertNotNull(vehicle);
        assertEquals(VehicleStatus.REJECTED, vehicle.getStatus());
        assertEquals(VehicleStatus.REJECTED, vehicle.getApprovalStatus());
        assertEquals("Incorrect engine specs matching the model", vehicle.getApprovalNote());

        // Check owner received rejection notification with the reason
        List<Notification> ownerNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(ownerUser.getId(), PageRequest.of(0, 10)).getContent();
        Notification rejectionNotif = ownerNotifications.stream()
                .filter(n -> "VEHICLE_REJECTED".equals(n.getType()))
                .findFirst().orElse(null);
        assertNotNull(rejectionNotif);
        assertTrue(rejectionNotif.getBody().contains("Incorrect engine specs matching the model"), "Owner notification should contain rejection reason");
    }

    // Test 5: Owner edits approved vehicle -> resets to PENDING_APPROVAL.
    @Test
    public void testOwnerEditsApprovedVehicleResetsToPending() throws Exception {
        VehicleDTOs.CreateVehicleRequest req = buildValidCreateRequest("43A-Workflow5");
        
        // Owner creates vehicle
        String createResponse = mockMvc.perform(addAuth(post("/api/v1/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String vehicleId = objectMapper.readTree(createResponse).path("vehicle").path("id").asText();

        // Admin approves vehicle
        mockMvc.perform(addAuth(put("/api/v1/admin/vehicles/" + vehicleId + "/approve"), adminUser))
                .andExpect(status().isOk());

        // Verify approved
        Vehicle vehicleBeforeEdit = vehicleRepository.findById(vehicleId).orElse(null);
        assertEquals(VehicleStatus.APPROVED, vehicleBeforeEdit.getApprovalStatus());

        // Owner edits a core detail (e.g., price per day)
        req.setPricePerDay(BigDecimal.valueOf(1500000));

        mockMvc.perform(addAuth(put("/api/v1/vehicles/" + vehicleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicle.status").value("pending_approval"))
                .andExpect(jsonPath("$.vehicle.approvalStatus").value("pending_approval"));

        // Verify in DB
        Vehicle vehicleAfterEdit = vehicleRepository.findById(vehicleId).orElse(null);
        assertEquals(VehicleStatus.PENDING_APPROVAL, vehicleAfterEdit.getStatus());
        assertEquals(VehicleStatus.PENDING_APPROVAL, vehicleAfterEdit.getApprovalStatus());
    }

    // Test 6: Owner attempts manual API call setting status to APPROVED -> 403 Forbidden.
    @Test
    public void testOwnerAttemptsManualStatusChangeDenied() throws Exception {
        VehicleDTOs.CreateVehicleRequest req = buildValidCreateRequest("43A-Workflow6");
        
        // Set manual status field to APPROVED in the payload
        req.setStatus("APPROVED");
        req.setApprovalStatus("APPROVED");

        // Try creating with APPROVED status
        mockMvc.perform(addAuth(post("/api/v1/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isForbidden());

        // Clear status to create validly
        req.setStatus(null);
        req.setApprovalStatus(null);
        String createResponse = mockMvc.perform(addAuth(post("/api/v1/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String vehicleId = objectMapper.readTree(createResponse).path("vehicle").path("id").asText();

        // Try updating with status = APPROVED
        req.setStatus("APPROVED");
        req.setApprovalStatus("APPROVED");
        mockMvc.perform(addAuth(put("/api/v1/vehicles/" + vehicleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isForbidden());

        // Try updating with status = AVAILABLE
        req.setStatus("AVAILABLE");
        req.setApprovalStatus("APPROVED");
        mockMvc.perform(addAuth(put("/api/v1/vehicles/" + vehicleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)), ownerUser))
                .andExpect(status().isForbidden());
    }
}
