package com.luxeway.service;

import com.luxeway.entity.SystemSetting;
import com.luxeway.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    public Optional<SystemSetting> getSettingByKey(String key) {
        return systemSettingRepository.findBySettingKey(key);
    }

    public String getSettingValue(String key, String defaultValue) {
        return cache.computeIfAbsent(key, k -> 
            systemSettingRepository.findBySettingKey(k)
                    .map(SystemSetting::getSettingValue)
                    .orElse(defaultValue)
        );
    }

    @Transactional
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new IllegalArgumentException("System setting key not found: " + key));

        // Validate percentage rates must be between 0 and 1
        if (key.endsWith("_rate") || key.endsWith("_ratio")) {
            try {
                double rate = Double.parseDouble(value);
                if (rate < 0.0 || rate > 1.0) {
                    throw new IllegalArgumentException("Rates and ratios must be a decimal value between 0.0 and 1.0");
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid decimal format for rate setting");
            }
        }

        setting.setSettingValue(value);
        SystemSetting saved = systemSettingRepository.save(setting);
        
        // Invalidate setting cache
        cache.put(key, value);
        log.info("System setting updated and cache synchronized: {} = {}", key, value);
        return saved;
    }
}
