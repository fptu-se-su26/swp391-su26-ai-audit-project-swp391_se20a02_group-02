package com.luxeway.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final MessageSource messageSource;
    private final JdbcTemplate jdbcTemplate;

    public String getMessage(String key, String langCode, Object... args) {
        Locale locale = getLocale(langCode);
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            // Fallback to English
            try {
                return messageSource.getMessage(key, args, Locale.ENGLISH);
            } catch (Exception ex) {
                return key;
            }
        }
    }

    public Locale getLocale(String langCode) {
        if (langCode == null) return Locale.ENGLISH;
        switch (langCode.toLowerCase()) {
            case "vi": return new Locale("vi");
            case "ja": return Locale.JAPANESE;
            case "ko": return Locale.KOREAN;
            case "zh": return Locale.SIMPLIFIED_CHINESE;
            case "fr": return Locale.FRENCH;
            case "de": return Locale.GERMAN;
            case "es": return new Locale("es");
            default: return Locale.ENGLISH;
        }
    }

    public String getCurrentLanguageCode() {
        try {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes) {
                HttpServletRequest request = ((ServletRequestAttributes) attrs).getRequest();
                
                // Query parameter "lang" has highest priority
                String lang = request.getParameter("lang");
                if (lang != null && !lang.trim().isEmpty()) {
                    return lang.trim().toLowerCase();
                }
                
                // Accept-Language header
                String header = request.getHeader("Accept-Language");
                if (header != null && !header.trim().isEmpty()) {
                    String[] parts = header.split(",");
                    if (parts.length > 0) {
                        String code = parts[0].split(";")[0].split("-")[0].trim().toLowerCase();
                        if (!code.isEmpty()) {
                            return code;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Context not available (e.g. background threads)
        }
        return "en";
    }

    public String translateVehicle(String vehicleId, String langCode, String originalName, String originalDescription, String originalCity, String originalAddress, String field) {
        if (langCode == null || langCode.equalsIgnoreCase("en")) {
            return getOriginalField(originalName, originalDescription, originalCity, originalAddress, field);
        }
        try {
            String sql = "SELECT name, description, city, address FROM vehicle_translations WHERE vehicle_id = ? AND language_code = ?";
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("name".equals(field)) return rs.getString("name");
                if ("description".equals(field)) return rs.getString("description");
                if ("city".equals(field)) return rs.getString("city");
                if ("address".equals(field)) return rs.getString("address");
                return null;
            }, vehicleId, langCode);
        } catch (Exception e) {
            return getOriginalField(originalName, originalDescription, originalCity, originalAddress, field);
        }
    }

    private String getOriginalField(String originalName, String originalDescription, String originalCity, String originalAddress, String field) {
        if ("name".equals(field)) return originalName;
        if ("description".equals(field)) return originalDescription;
        if ("city".equals(field)) return originalCity;
        if ("address".equals(field)) return originalAddress;
        return null;
    }

    public String translateCar(String carId, String langCode, String originalName, String originalDescription, String field) {
        if (langCode == null || langCode.equalsIgnoreCase("en")) {
            return "name".equals(field) ? originalName : originalDescription;
        }
        try {
            String sql = "SELECT name, description FROM car_translations WHERE car_id = ? AND language_code = ?";
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("name".equals(field)) return rs.getString("name");
                if ("description".equals(field)) return rs.getString("description");
                return null;
            }, carId, langCode);
        } catch (Exception e) {
            return "name".equals(field) ? originalName : originalDescription;
        }
    }

    public String translateMotorbike(String motorbikeId, String langCode, String originalName, String originalDescription, String field) {
        if (langCode == null || langCode.equalsIgnoreCase("en")) {
            return "name".equals(field) ? originalName : originalDescription;
        }
        try {
            String sql = "SELECT name, description FROM motorbike_translations WHERE motorbike_id = ? AND language_code = ?";
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("name".equals(field)) return rs.getString("name");
                if ("description".equals(field)) return rs.getString("description");
                return null;
            }, motorbikeId, langCode);
        } catch (Exception e) {
            return "name".equals(field) ? originalName : originalDescription;
        }
    }

    public String translateReview(String reviewId, String langCode, String originalComment) {
        if (langCode == null || langCode.equalsIgnoreCase("en")) {
            return originalComment;
        }
        try {
            String sql = "SELECT comment FROM review_translations WHERE review_id = ? AND language_code = ?";
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> rs.getString("comment"), reviewId, langCode);
        } catch (Exception e) {
            return originalComment;
        }
    }

    public String translateNotification(String notificationId, String langCode, String originalTitle, String originalBody, String field) {
        if (langCode == null || langCode.equalsIgnoreCase("en")) {
            return "title".equals(field) ? originalTitle : originalBody;
        }
        try {
            String sql = "SELECT title, body FROM notification_translations WHERE notification_id = ? AND language_code = ?";
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("title".equals(field)) return rs.getString("title");
                if ("body".equals(field)) return rs.getString("body");
                return null;
            }, notificationId, langCode);
        } catch (Exception e) {
            return "title".equals(field) ? originalTitle : originalBody;
        }
    }
}

