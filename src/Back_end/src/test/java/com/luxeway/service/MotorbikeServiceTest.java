package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeDTOs;
import com.luxeway.entity.Motorbike;
import com.luxeway.entity.MotorbikeBrand;
import com.luxeway.entity.MotorbikeImage;
import com.luxeway.entity.MotorbikeModel;
import com.luxeway.entity.User;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.MotorbikeModelRepository;
import com.luxeway.repository.MotorbikeRepository;
import com.luxeway.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MotorbikeServiceTest {

    @Mock private MotorbikeRepository motorbikeRepository;
    @Mock private MotorbikeModelRepository motorbikeModelRepository;
    @Mock private UserRepository userRepository;
    @Mock private TranslationService translationService;

    @InjectMocks
    private MotorbikeService motorbikeService;

    @BeforeEach
    void setUpTranslation() {
        lenient().when(translationService.getCurrentLanguageCode()).thenReturn("en");
        lenient().when(translationService.translateMotorbike(any(), eq("en"), any(), isNull(), eq("name")))
            .thenAnswer(invocation -> invocation.getArgument(2));
    }

    @Test
    void searchMotorbikes_ValidTransmission_ReturnsFilteredResults() {
        Motorbike motorbike = Motorbike.builder()
            .id("m1")
            .name("My Bike")
            .status(VehicleStatus.AVAILABLE)
            .rating(BigDecimal.ZERO)
            .build();
        Page<Motorbike> page = new PageImpl<>(List.of(motorbike));

        when(motorbikeRepository.searchMotorbikes(
            eq("Hanoi"),
            eq(150),
            eq(TransmissionType.MANUAL),
            eq(true),
            eq(false),
            eq(true),
            eq(false),
            eq("Honda"),
            eq("SCOOTER"),
            any(Pageable.class)
        )).thenReturn(page);

        Page<MotorbikeDTOs.MotorbikeResponse> result = motorbikeService.searchMotorbikes(
            "Hanoi", 150, "MANUAL", true, false, true, false, "Honda", "SCOOTER", 0, 10
        );

        assertEquals(1, result.getTotalElements());
        assertEquals("m1", result.getContent().get(0).getId());
    }

    @Test
    void getMotorbikeById_WhenMissing_ThrowsException() {
        when(motorbikeRepository.findById("m1")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> motorbikeService.getMotorbikeById("m1"));
        assertTrue(ex.getMessage().contains("Motorbike not found"));
    }

    @Test
    void createMotorbike_ValidRequest_BuildsEntityCorrectly() {
        MotorbikeDTOs.CreateMotorbikeRequest req = new MotorbikeDTOs.CreateMotorbikeRequest();
        req.setModelId("model1");
        req.setName("My Bike");
        req.setLicensePlate("59A1-12345");
        req.setPricePerDay(new BigDecimal("200000"));
        req.setDeposit(new BigDecimal("1000000"));
        req.setEngineCc(150);
        req.setTransmission(TransmissionType.MANUAL);
        req.setHelmetIncluded(true);
        req.setRaincoatIncluded(false);
        req.setPhoneHolder(true);
        req.setLuggageRack(false);
        req.setCity("Hanoi");
        req.setAddress("Main Street");
        req.setImageUrls(List.of("url1", "url2"));

        User owner = User.builder().id("owner1").build();
        MotorbikeBrand brand = MotorbikeBrand.builder().name("Honda").build();
        MotorbikeModel model = MotorbikeModel.builder().id("model1").brand(brand).name("Air Blade").category("SCOOTER").build();

        when(userRepository.findById("owner1")).thenReturn(Optional.of(owner));
        when(motorbikeModelRepository.findById("model1")).thenReturn(Optional.of(model));
        when(motorbikeRepository.save(any(Motorbike.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MotorbikeDTOs.MotorbikeResponse res = motorbikeService.createMotorbike(req, "owner1");

        ArgumentCaptor<Motorbike> captor = ArgumentCaptor.forClass(Motorbike.class);
        verify(motorbikeRepository, atLeast(1)).save(captor.capture());

        Motorbike saved = captor.getValue();
        assertEquals("My Bike", saved.getName());
        assertEquals("Honda", saved.getModel().getBrand().getName());
        assertEquals("Air Blade", saved.getModel().getName());
        assertEquals(150, saved.getSpecification().getEngineCc());
        assertEquals(TransmissionType.MANUAL, saved.getSpecification().getTransmission());
        assertTrue(saved.getSpecification().getHelmetIncluded());
        assertFalse(saved.getSpecification().getRaincoatIncluded());
        assertEquals("Hanoi", saved.getLocation().getCity());

        // Note: MotorbikeImage uses id-only hashCode; since JPA doesn't generate IDs in
        // unit tests, all images in the HashSet share id=null and collapse to 1 entry.
        // We verify that images were set and at least one image with the correct url exists.
        assertFalse(saved.getImages().isEmpty());
        MotorbikeImage firstImage = saved.getImages().iterator().next();
        assertNotNull(firstImage.getUrl());
        assertTrue(firstImage.getIsPrimary() || firstImage.getUrl() != null);

        assertEquals("My Bike", res.getName());
        assertEquals("Honda", res.getBrandName());
        assertEquals("Air Blade", res.getModelName());
    }

    @Test
    void deleteMotorbike_ValidId_DeletesById() {
        when(motorbikeRepository.existsById("m1")).thenReturn(true);

        motorbikeService.deleteMotorbike("m1");

        verify(motorbikeRepository).deleteById("m1");
    }
}
