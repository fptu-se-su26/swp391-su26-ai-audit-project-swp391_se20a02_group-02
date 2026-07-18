package com.luxeway.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeway.entity.Car;
import com.luxeway.entity.CarInsurance;
import com.luxeway.entity.InsurancePackage;
import com.luxeway.entity.Motorbike;
import com.luxeway.entity.MotorbikeDeposit;
import com.luxeway.repository.CarInsuranceRepository;
import com.luxeway.repository.InsurancePackageRepository;
import com.luxeway.repository.MotorbikeDepositRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({"h2", "dev"})
@SuppressWarnings("all")
public class InsuranceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CarInsuranceRepository carInsuranceRepository;

    @MockBean
    private MotorbikeDepositRepository motorbikeDepositRepository;

    @MockBean
    private InsurancePackageRepository insurancePackageRepository;

    private List<InsurancePackage> dummyGlobals;
    private CarInsurance specificInsurance;
    private MotorbikeDeposit activeDeposit;

    @BeforeEach
    public void setUp() {
        // Setup dummy global packages
        dummyGlobals = new ArrayList<>();
        dummyGlobals.add(InsurancePackage.builder()
                .id("glob-001")
                .name("Bảo hiểm tiêu chuẩn")
                .provider("PVI")
                .costPerDay(BigDecimal.valueOf(100000.00))
                .coverageLimit(BigDecimal.valueOf(30000000.00))
                .description("Mô tả bảo hiểm toàn cầu")
                .isActive(true)
                .build());

        dummyGlobals.add(InsurancePackage.builder()
                .id("glob-002")
                .name("Bảo hiểm vàng")
                .provider("Bảo Việt")
                .costPerDay(BigDecimal.valueOf(200000.00))
                .coverageLimit(BigDecimal.valueOf(60000000.00))
                .description("Bảo hiểm toàn diện")
                .isActive(false) // Inactive package
                .build());

        // Setup specific car insurance
        specificInsurance = CarInsurance.builder()
                .id("ins-001")
                .name("Bảo hiểm thân vỏ Gold")
                .description("Bảo hiểm 100% thiệt hại thân vỏ")
                .costPerDay(BigDecimal.valueOf(150000.00))
                .coverageLimit(BigDecimal.valueOf(50000000.00))
                .isActive(true)
                .build();

        // Setup motorbike deposit
        activeDeposit = MotorbikeDeposit.builder()
                .id("dep-001")
                .amount(BigDecimal.valueOf(10000000.00))
                .description("Cọc giữ xe bằng tiền mặt hoặc chuyển khoản")
                .isActive(true)
                .build();
    }

    @Test
    public void testGetCarInsurances_SpecificActive_TC_ID_001_and_005() throws Exception {
        String carId = "car-123";
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue(carId))
                .thenReturn(new ArrayList<>(List.of(specificInsurance)));

        mockMvc.perform(get("/api/v1/insurance/car/" + carId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Car insurances loaded")))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is("ins-001")))
                .andExpect(jsonPath("$.data[0].name", is("Bảo hiểm thân vỏ Gold")))
                .andExpect(jsonPath("$.data[0].costPerDay", is(150000.00)))
                .andExpect(jsonPath("$.data[0].coverageLimit", is(50000000.00)))
                .andExpect(jsonPath("$.data[0].isActive", is(true)))
                // Verify schema schema fields of CarInsurance does NOT contain "car" (TC-ID-005)
                .andExpect(jsonPath("$.data[0].car").doesNotExist());
    }

    @Test
    public void testGetCarInsurances_FallbackToGlobal_TC_ID_002_and_004() throws Exception {
        // Mock specific packages as empty (TC-ID-002/004)
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue("CAR_NO_SPECIFIC_INSURANCE"))
                .thenReturn(new ArrayList<>());
        when(insurancePackageRepository.findAll()).thenReturn(dummyGlobals);

        mockMvc.perform(get("/api/v1/insurance/car/CAR_NO_SPECIFIC_INSURANCE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                // Verify global packages mapped into CarInsurance structure
                .andExpect(jsonPath("$.data[0].id", is("glob-001")))
                .andExpect(jsonPath("$.data[0].name", is("Bảo hiểm tiêu chuẩn")))
                .andExpect(jsonPath("$.data[0].costPerDay", is(100000.00)))
                .andExpect(jsonPath("$.data[1].id", is("glob-002")))
                .andExpect(jsonPath("$.data[1].costPerDay", is(200000.00)));
    }

    @Test
    public void testGetCarInsurances_FallbackEmpty_TC_ID_003_and_021() throws Exception {
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue("CAR_NO_CONFIG"))
                .thenReturn(new ArrayList<>());
        when(insurancePackageRepository.findAll()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/api/v1/insurance/car/CAR_NO_CONFIG")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    public void testGetCarInsurances_UUIDLength_TC_ID_006() throws Exception {
        String uuid = "12345678-1234-1234-1234-123456789012";
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue(uuid))
                .thenReturn(new ArrayList<>(List.of(specificInsurance)));

        mockMvc.perform(get("/api/v1/insurance/car/" + uuid)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    public void testGetCarInsurances_SqlInjection_TC_ID_007() throws Exception {
        String sqlInjectionPayload = "' OR 1=1 --";
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue(sqlInjectionPayload))
                .thenReturn(new ArrayList<>());
        when(insurancePackageRepository.findAll()).thenReturn(dummyGlobals);

        mockMvc.perform(get("/api/v1/insurance/car/" + sqlInjectionPayload)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2))); // Safely falls back to global packages list
    }

    @Test
    public void testGetCarInsurances_PathTraversal_TC_ID_008() throws Exception {
        mockMvc.perform(get("/api/v1/insurance/car/../../admin")
                        .contentType(MediaType.APPLICATION_JSON))
                // Normalized to base path causing either MethodNotAllowed, NotFound, or Forbidden depending on spring routing.
                // Standard Tomcat normalizes the URL. MockMvc resolves it relative to context.
                // We assert it does NOT return 200 OK with car insurance list.
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testGetMotorbikeDeposits_Success_TC_ID_009_and_011() throws Exception {
        String bikeId = "bike-123";
        when(motorbikeDepositRepository.findByMotorbikeIdAndIsActiveTrue(bikeId))
                .thenReturn(new ArrayList<>(List.of(activeDeposit)));

        mockMvc.perform(get("/api/v1/insurance/motorbike/" + bikeId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Motorbike deposits loaded")))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is("dep-001")))
                .andExpect(jsonPath("$.data[0].amount", is(10000000.00)))
                .andExpect(jsonPath("$.data[0].description", is("Cọc giữ xe bằng tiền mặt hoặc chuyển khoản")))
                .andExpect(jsonPath("$.data[0].isActive", is(true)))
                // Verify schema of MotorbikeDeposit does NOT contain "motorbike" (TC-ID-011)
                .andExpect(jsonPath("$.data[0].motorbike").doesNotExist());
    }

    @Test
    public void testGetMotorbikeDeposits_NoConfig_TC_ID_010() throws Exception {
        when(motorbikeDepositRepository.findByMotorbikeIdAndIsActiveTrue("BIKE_NO_CONFIG"))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/api/v1/insurance/motorbike/BIKE_NO_CONFIG")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    public void testGetMotorbikeDeposits_PathTraversal_TC_ID_013() throws Exception {
        mockMvc.perform(get("/api/v1/insurance/motorbike/../../admin")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testGetGlobalPackages_Success_TC_ID_014_and_016_and_017() throws Exception {
        when(insurancePackageRepository.findAll()).thenReturn(dummyGlobals);

        mockMvc.perform(get("/api/v1/insurance/global")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Global insurance packages loaded")))
                // Verify all packages (active & inactive) are returned (TC-ID-017)
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id", is("glob-001")))
                .andExpect(jsonPath("$.data[0].provider", is("PVI")))
                .andExpect(jsonPath("$.data[0].isActive", is(true)))
                .andExpect(jsonPath("$.data[1].id", is("glob-002")))
                .andExpect(jsonPath("$.data[1].isActive", is(false)))
                // Verify schema schema fields of global package (TC-ID-016)
                .andExpect(jsonPath("$.data[0].id", notNullValue()))
                .andExpect(jsonPath("$.data[0].name", notNullValue()))
                .andExpect(jsonPath("$.data[0].provider", notNullValue()))
                .andExpect(jsonPath("$.data[0].costPerDay", notNullValue()))
                .andExpect(jsonPath("$.data[0].coverageLimit", notNullValue()))
                .andExpect(jsonPath("$.data[0].description", notNullValue()))
                .andExpect(jsonPath("$.data[0].isActive", notNullValue()));
    }

    @Test
    public void testGetGlobalPackages_Empty_TC_ID_015() throws Exception {
        when(insurancePackageRepository.findAll()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/api/v1/insurance/global")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    public void testGetGlobalPackages_WithUnnecessaryBody_TC_ID_018() throws Exception {
        when(insurancePackageRepository.findAll()).thenReturn(dummyGlobals);

        mockMvc.perform(get("/api/v1/insurance/global")
                        .content("{\"extra\":\"body_content\"}")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2))); // IGNORES request body and proceeds
    }

    @Test
    public void testPublicEndpoints_NoJWT_TC_ID_019() throws Exception {
        // Assert all 3 GET routes load correctly without authentication
        mockMvc.perform(get("/api/v1/insurance/car/any-car"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/insurance/motorbike/any-bike"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/insurance/global"))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetMotorbikeDeposits_EmptyPath_TC_ID_020() throws Exception {
        mockMvc.perform(get("/api/v1/insurance/motorbike/"))
                .andExpect(status().isNotFound()); // Standard route mismatch returns 404
    }

    @Test
    public void testGetCarInsurances_NullByte_TC_ID_022() throws Exception {
        String decodedNullByte = "CAR\0HACK";
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue(decodedNullByte))
                .thenReturn(new ArrayList<>());
        when(insurancePackageRepository.findAll()).thenReturn(dummyGlobals);

        int status = mockMvc.perform(get("/api/v1/insurance/car/CAR%00HACK")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn().getResponse().getStatus();
        org.junit.jupiter.api.Assertions.assertTrue(status == 200 || status == 400);
    }

    @Test
    public void testGetCarInsurances_NonUuid_TC_ID_023() throws Exception {
        String nonUuid = "CAR-XE-CO-DIEN";
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue(nonUuid))
                .thenReturn(new ArrayList<>(List.of(specificInsurance)));

        mockMvc.perform(get("/api/v1/insurance/car/" + nonUuid)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is("ins-001")));
    }

    @Test
    public void testGetMotorbikeDeposits_MultipleActive_TC_ID_024() throws Exception {
        String bikeId = "bike-multi";
        List<MotorbikeDeposit> deposits = List.of(
                MotorbikeDeposit.builder().id("dep-1").amount(BigDecimal.ONE).isActive(true).build(),
                MotorbikeDeposit.builder().id("dep-2").amount(BigDecimal.TEN).isActive(true).build(),
                MotorbikeDeposit.builder().id("dep-3").amount(BigDecimal.ZERO).isActive(true).build()
        );
        when(motorbikeDepositRepository.findByMotorbikeIdAndIsActiveTrue(bikeId))
                .thenReturn(new ArrayList<>(deposits));

        mockMvc.perform(get("/api/v1/insurance/motorbike/" + bikeId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[0].id", is("dep-1")))
                .andExpect(jsonPath("$.data[1].id", is("dep-2")))
                .andExpect(jsonPath("$.data[2].id", is("dep-3")));
    }

    @Test
    public void testPostGlobalPackages_NotAllowed_TC_ID_027() throws Exception {
        mockMvc.perform(post("/api/v1/insurance/global")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"package\"}"))
                .andExpect(status().isMethodNotAllowed()); // POST not supported returns 405
    }

    @Test
    public void testContentNegotiationAcceptXml_TC_ID_028() throws Exception {
        mockMvc.perform(get("/api/v1/insurance/global")
                        .header("Accept", "application/xml"))
                // Spring MVC default negotiation: Returns 406 Not Acceptable (since no XML Message Converter is configured)
                // or falls back to returning standard JSON. Both satisfy "406 or default JSON".
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testGetCarInsurances_Unicode_TC_ID_029() throws Exception {
        String unicodeId = "CAR-XE-Ô-TÔ";
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue(unicodeId))
                .thenReturn(new ArrayList<>());
        when(insurancePackageRepository.findAll()).thenReturn(dummyGlobals);

        mockMvc.perform(get("/api/v1/insurance/car/" + unicodeId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    public void testGetCarInsurances_ExtremelyLongId_TC_ID_030() throws Exception {
        String longId = "a".repeat(255);
        when(carInsuranceRepository.findByCarIdAndIsActiveTrue(longId))
                .thenReturn(new ArrayList<>());
        when(insurancePackageRepository.findAll()).thenReturn(dummyGlobals);

        mockMvc.perform(get("/api/v1/insurance/car/" + longId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));
    }
}
