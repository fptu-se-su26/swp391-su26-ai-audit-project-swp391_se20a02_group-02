package com.luxeway.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final MessageSource messageSource;

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
            default: return Locale.ENGLISH;
        }
    }
}
