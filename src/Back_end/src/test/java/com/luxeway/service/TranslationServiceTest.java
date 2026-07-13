package com.luxeway.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TranslationServiceTest {

    @Mock
    private MessageSource messageSource;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private TranslationService translationService;

    // =======================================================
    // getMessage
    // =======================================================

    @Test
    void getMessage_ValidKeyAndLocale_ReturnsLocalizedMessage() {
        String key = "welcome.msg";
        String langCode = "fr";
        Locale locale = Locale.FRENCH;
        String expected = "Bienvenue";

        when(messageSource.getMessage(eq(key), any(Object[].class), eq(locale))).thenReturn(expected);

        String result = translationService.getMessage(key, langCode);

        assertEquals(expected, result);
    }

    @Test
    void getMessage_InvalidKeyInTarget_ReturnsEnglishFallback() {
        String key = "missing.key";
        String langCode = "fr";
        Locale frLocale = Locale.FRENCH;
        Locale enLocale = Locale.ENGLISH;
        String fallback = "Default Message";

        when(messageSource.getMessage(eq(key), any(Object[].class), eq(frLocale))).thenThrow(new NoSuchMessageException("Not found"));
        when(messageSource.getMessage(eq(key), any(Object[].class), eq(enLocale))).thenReturn(fallback);

        String result = translationService.getMessage(key, langCode);

        assertEquals(fallback, result);
    }

    @Test
    void getMessage_KeyNotFoundAnywhere_ReturnsRawKey() {
        String key = "unknown.key";
        String langCode = "fr";
        Locale frLocale = Locale.FRENCH;
        Locale enLocale = Locale.ENGLISH;

        when(messageSource.getMessage(eq(key), any(Object[].class), eq(frLocale))).thenThrow(new NoSuchMessageException("Not found"));
        when(messageSource.getMessage(eq(key), any(Object[].class), eq(enLocale))).thenThrow(new NoSuchMessageException("Not found"));

        String result = translationService.getMessage(key, langCode);

        assertEquals(key, result);
    }

    // =======================================================
    // getLocale
    // =======================================================

    @Test
    void getLocale_NullLangCode_ReturnsEnglish() {
        Locale result = translationService.getLocale(null);

        assertEquals(Locale.ENGLISH, result);
    }

    @Test
    void getLocale_UnsupportedCode_ReturnsEnglish() {
        // "es" is mapped to Locale.forLanguageTag("es"), not Locale.ENGLISH;
        // use a truly unsupported code to hit the default branch
        String unsupportedCode = "xx";

        Locale result = translationService.getLocale(unsupportedCode);

        assertEquals(Locale.ENGLISH, result);
    }

    @Test
    void getMessage_EmptyKey_ReturnsRawKey() {
        String key = "";
        String langCode = "en";

        when(messageSource.getMessage(eq(key), any(Object[].class), eq(Locale.ENGLISH))).thenThrow(new NoSuchMessageException("Empty"));

        String result = translationService.getMessage(key, langCode);

        assertEquals("", result);
    }
}
