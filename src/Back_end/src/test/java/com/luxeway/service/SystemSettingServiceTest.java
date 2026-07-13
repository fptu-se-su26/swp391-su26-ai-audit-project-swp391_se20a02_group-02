package com.luxeway.service;

import com.luxeway.entity.SystemSetting;
import com.luxeway.repository.SystemSettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemSettingServiceTest {

    @Mock private SystemSettingRepository systemSettingRepository;

    @InjectMocks
    private SystemSettingService systemSettingService;

    // =======================================================
    // getAllSettings
    // =======================================================

    @Test
    void getAllSettings_ExistingSettings_ReturnsList() {
        SystemSetting s1 = SystemSetting.builder().settingKey("key1").settingValue("val1").build();
        SystemSetting s2 = SystemSetting.builder().settingKey("key2").settingValue("val2").build();
        when(systemSettingRepository.findAll()).thenReturn(List.of(s1, s2));

        List<SystemSetting> result = systemSettingService.getAllSettings();

        assertEquals(2, result.size());
        assertEquals("key1", result.get(0).getSettingKey());
        assertEquals("val1", result.get(0).getSettingValue());
    }

    // =======================================================
    // getSettingByKey
    // =======================================================

    @Test
    void getSettingByKey_ExistingKey_ReturnsOptional() {
        SystemSetting setting = SystemSetting.builder().settingKey("timeout").settingValue("30").build();
        when(systemSettingRepository.findBySettingKey("timeout")).thenReturn(Optional.of(setting));

        Optional<SystemSetting> result = systemSettingService.getSettingByKey("timeout");

        assertTrue(result.isPresent());
        assertEquals("30", result.get().getSettingValue());
    }

    // =======================================================
    // getSettingValue
    // =======================================================

    @Test
    void getSettingValue_MissingKey_ReturnsDefaultAndCaches() {
        when(systemSettingRepository.findBySettingKey("unknown")).thenReturn(Optional.empty());

        String result1 = systemSettingService.getSettingValue("unknown", "default_val");
        String result2 = systemSettingService.getSettingValue("unknown", "default_val");

        assertEquals("default_val", result1);
        assertEquals("default_val", result2);
        // Should only query repository once because of cache
        verify(systemSettingRepository, times(1)).findBySettingKey("unknown");
    }

    @Test
    void getSettingValue_ExistingKey_ReturnsValueAndCaches() {
        SystemSetting setting = SystemSetting.builder().settingKey("theme").settingValue("dark").build();
        when(systemSettingRepository.findBySettingKey("theme")).thenReturn(Optional.of(setting));

        String result1 = systemSettingService.getSettingValue("theme", "light");
        String result2 = systemSettingService.getSettingValue("theme", "light");

        assertEquals("dark", result1);
        assertEquals("dark", result2);
        // Cache prevents second query
        verify(systemSettingRepository, times(1)).findBySettingKey("theme");
    }

    // =======================================================
    // updateSetting
    // =======================================================

    @Test
    void updateSetting_ExistingKey_UpdatesAndReturns() {
        SystemSetting existing = SystemSetting.builder().settingKey("theme").settingValue("light").build();
        when(systemSettingRepository.findBySettingKey("theme")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.save(existing)).thenAnswer(i -> i.getArgument(0));

        SystemSetting result = systemSettingService.updateSetting("theme", "dark");

        ArgumentCaptor<SystemSetting> captor = ArgumentCaptor.forClass(SystemSetting.class);
        verify(systemSettingRepository).save(captor.capture());
        assertEquals("dark", captor.getValue().getSettingValue());
        assertEquals("dark", result.getSettingValue());
    }

    @Test
    void updateSetting_NonExistentKey_ThrowsIllegalArgumentException() {
        when(systemSettingRepository.findBySettingKey("missing")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> systemSettingService.updateSetting("missing", "val"));
    }

    @Test
    void updateSetting_RateOutOfRange_ThrowsIllegalArgumentException() {
        SystemSetting rateSetting = SystemSetting.builder().settingKey("tax_rate").settingValue("0.1").build();
        when(systemSettingRepository.findBySettingKey("tax_rate")).thenReturn(Optional.of(rateSetting));

        assertThrows(IllegalArgumentException.class, () -> systemSettingService.updateSetting("tax_rate", "1.5"));
    }

    @Test
    void updateSetting_ValidRate_UpdatesSuccessfully() {
        SystemSetting rateSetting = SystemSetting.builder().settingKey("tax_rate").settingValue("0.1").build();
        when(systemSettingRepository.findBySettingKey("tax_rate")).thenReturn(Optional.of(rateSetting));
        when(systemSettingRepository.save(rateSetting)).thenAnswer(i -> i.getArgument(0));

        SystemSetting result = systemSettingService.updateSetting("tax_rate", "0.5");

        ArgumentCaptor<SystemSetting> captor = ArgumentCaptor.forClass(SystemSetting.class);
        verify(systemSettingRepository).save(captor.capture());
        assertEquals("0.5", captor.getValue().getSettingValue());
        assertEquals("0.5", result.getSettingValue());
    }

    @Test
    void updateSetting_InvalidRateFormat_ThrowsIllegalArgumentException() {
        SystemSetting rateSetting = SystemSetting.builder().settingKey("tax_rate").settingValue("0.1").build();
        when(systemSettingRepository.findBySettingKey("tax_rate")).thenReturn(Optional.of(rateSetting));

        assertThrows(IllegalArgumentException.class, () -> systemSettingService.updateSetting("tax_rate", "invalid"));
    }

    @Test
    void updateSetting_BoundaryRates_UpdatesSuccessfully() {
        SystemSetting rateSetting = SystemSetting.builder().settingKey("tax_rate").settingValue("0.1").build();
        when(systemSettingRepository.findBySettingKey("tax_rate")).thenReturn(Optional.of(rateSetting));
        when(systemSettingRepository.save(rateSetting)).thenAnswer(i -> i.getArgument(0));

        systemSettingService.updateSetting("tax_rate", "0.0");
        systemSettingService.updateSetting("tax_rate", "1.0");

        ArgumentCaptor<SystemSetting> captor = ArgumentCaptor.forClass(SystemSetting.class);
        verify(systemSettingRepository, times(2)).save(captor.capture());
        assertEquals("1.0", captor.getAllValues().get(1).getSettingValue());
    }
}
