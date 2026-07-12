package com.luxeway.service;

import com.luxeway.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private LocationService locationService;

    // =======================================================
    // getTopCities
    // =======================================================

    @Test
    void getTopCities_HaNoi_ReturnsHaNoiImageUrl() {
        Object[] row = {"Ha Noi", 100L};
        when(vehicleRepository.findTopCities(any(Pageable.class))).thenReturn(java.util.Collections.singletonList(row));

        List<Map<String, Object>> result = locationService.getTopCities(5);

        assertEquals(1, result.size());
        assertEquals("Ha Noi", result.get(0).get("name"));
        assertEquals(100L, result.get(0).get("vehicles"));
        assertEquals("Vietnam", result.get(0).get("country"));
        assertTrue(((String) result.get(0).get("image")).contains("unsplash.com/photo-1559592413-7cec4d0cae2b"));
    }

    @Test
    void getTopCities_DaNang_ReturnsDaNangImageUrl() {
        Object[] row = {"Da Nang", 50L};
        when(vehicleRepository.findTopCities(any(Pageable.class))).thenReturn(java.util.Collections.singletonList(row));

        List<Map<String, Object>> result = locationService.getTopCities(5);

        assertEquals(1, result.size());
        assertTrue(((String) result.get(0).get("image")).contains("unsplash.com/photo-1518684079-3c830dcef090"));
    }

    @Test
    void getTopCities_NhaTrang_ReturnsNhaTrangImageUrl() {
        Object[] row = {"Nha Trang", 30L};
        when(vehicleRepository.findTopCities(any(Pageable.class))).thenReturn(java.util.Collections.singletonList(row));

        List<Map<String, Object>> result = locationService.getTopCities(5);

        assertEquals(1, result.size());
        assertTrue(((String) result.get(0).get("image")).contains("unsplash.com/photo-1506966953602-c20cc11f75e3"));
    }

    @Test
    void getTopCities_OtherCity_ReturnsDefaultImageUrl() {
        Object[] row = {"Hồ Chí Minh", 200L};
        when(vehicleRepository.findTopCities(any(Pageable.class))).thenReturn(java.util.Collections.singletonList(row));

        List<Map<String, Object>> result = locationService.getTopCities(5);

        assertEquals(1, result.size());
        assertTrue(((String) result.get(0).get("image")).contains("unsplash.com/photo-1583417319070-4a69db38a482"));
    }

    @Test
    void getTopCities_EmptyRepository_ReturnsEmptyList() {
        when(vehicleRepository.findTopCities(any(Pageable.class))).thenReturn(Collections.<Object[]>emptyList());

        List<Map<String, Object>> result = locationService.getTopCities(5);

        assertTrue(result.isEmpty());
    }

    @Test
    void getTopCities_ZeroOrNegativeLimit_ThrowsIllegalArgumentException() {
        // PageRequest.of throws IllegalArgumentException for size < 1
        assertThrows(IllegalArgumentException.class, () -> locationService.getTopCities(0));
        assertThrows(IllegalArgumentException.class, () -> locationService.getTopCities(-1));
    }
}
