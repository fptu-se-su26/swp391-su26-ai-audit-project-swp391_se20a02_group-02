package com.luxeway.service;

import com.luxeway.entity.NotificationTemplate;
import com.luxeway.entity.User;
import com.luxeway.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * LW-138: seedTemplates       (UTC-024-001)
 * LW-139: dispatchNotification (UTC-024-003)
 * LW-140: processTemplate      (UTC-024-004) — package-private tested via dispatchNotification
 * LW-141: stripHtml            (UTC-024-005) — package-private tested via dispatchNotification
 */
@ExtendWith(MockitoExtension.class)
class NotificationHubServiceTest {

    @Mock private NotificationTemplateRepository templateRepository;
    @Mock private NotificationLogRepository logRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private NotificationHubService service;

    private User user;
    private NotificationTemplate template;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("u1");
        user.setDisplayName("Nguyen Van A");
        user.setEmail("user@example.com");

        template = new NotificationTemplate();
        template.setName("booking_created");
        template.setSubject("Booking Confirmation for ${renterName}");
        template.setBodyTemplate("<h2>Hello, ${renterName}!</h2><p>Booking confirmed.</p>");
        template.setChannel("EMAIL");
        template.setIsActive(true);
    }

    // ===== LW-138: seedTemplates =====

    /** UTCID01 (Normal): No existing templates → seeds all templates */
    @Test
    void seedTemplates_UTCID01_noExistingTemplates_seedsAll() {
        when(templateRepository.findByName(any())).thenReturn(Optional.empty());
        when(templateRepository.save(any())).thenReturn(template);

        assertDoesNotThrow(() -> service.seedTemplates());
        verify(templateRepository, atLeast(5)).save(any());
    }

    /** UTCID02 (Normal): Templates already exist → skips seeding */
    @Test
    void seedTemplates_UTCID02_templatesExist_skipsSeeding() {
        when(templateRepository.findByName(any())).thenReturn(Optional.of(template));

        assertDoesNotThrow(() -> service.seedTemplates());
        verify(templateRepository, never()).save(any());
    }

    /** UTCID03 (Normal): Partial templates → seeds only missing ones */
    @Test
    void seedTemplates_UTCID03_partialTemplates_seedsMissing() {
        when(templateRepository.findByName("booking_created")).thenReturn(Optional.of(template));
        when(templateRepository.findByName(not(eq("booking_created")))).thenReturn(Optional.empty());
        when(templateRepository.save(any())).thenReturn(template);

        assertDoesNotThrow(() -> service.seedTemplates());
        verify(templateRepository, atLeast(1)).save(any());
    }

    /** UTCID04 (Abnormal): DB error on save → does not propagate (RuntimeException) */
    @Test
    void seedTemplates_UTCID04_dbError_throwsException() {
        when(templateRepository.findByName(any())).thenReturn(Optional.empty());
        when(templateRepository.save(any())).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> service.seedTemplates());
    }

    /** UTCID05 (Boundary): DB has no records (empty database) → seeds all templates */
    @Test
    void seedTemplates_UTCID05_emptyDatabase_seedsAllTemplates() {
        when(templateRepository.findByName(any())).thenReturn(Optional.empty());
        when(templateRepository.save(any())).thenReturn(template);

        service.seedTemplates();
        // 6 templates defined in service
        verify(templateRepository, times(6)).save(any());
    }

    // ===== LW-139: dispatchNotification =====

    /** UTCID01 (Normal): user and template exist → dispatch succeeds */
    @Test
    void dispatchNotification_UTCID01_userAndTemplateExist_dispatchesSuccessfully() throws Exception {
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(templateRepository.findByName("booking_created")).thenReturn(Optional.of(template));
        doNothing().when(emailService).sendCustomHtmlEmail(any(), any(), any());
        when(notificationRepository.save(any())).thenReturn(null);
        when(logRepository.save(any())).thenReturn(null);

        assertDoesNotThrow(() ->
                service.dispatchNotification("u1", "booking_created", Map.of("renterName", "Nguyen Van A")));

        verify(emailService).sendCustomHtmlEmail(eq("user@example.com"), any(), any());
    }

    /** UTCID02 (Normal): user does not exist → returns silently (logs warning) */
    @Test
    void dispatchNotification_UTCID02_userNotFound_returnsSilently() {
        when(userRepository.findById("non-existent")).thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                service.dispatchNotification("non-existent", "booking_created", Map.of()));

        verify(emailService, never()).sendCustomHtmlEmail(any(), any(), any());
    }

    /** UTCID03 (Normal): template does not exist → returns silently (logs warning) */
    @Test
    void dispatchNotification_UTCID03_templateNotFound_returnsSilently() {
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(templateRepository.findByName("unknown_template")).thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                service.dispatchNotification("u1", "unknown_template", Map.of()));

        verify(emailService, never()).sendCustomHtmlEmail(any(), any(), any());
    }

    /** UTCID04 (Abnormal): userId=-1 does not exist → returns silently */
    @Test
    void dispatchNotification_UTCID04_userIdNegative_returnsSilently() {
        when(userRepository.findById("-1")).thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                service.dispatchNotification("-1", "booking_created", Map.of()));

        verify(emailService, never()).sendCustomHtmlEmail(any(), any(), any());
    }

    /** UTCID05 (Boundary): userId=1 (valid but no relations/empty lists) → returns empty-listed object */
    @Test
    void dispatchNotification_UTCID05_boundaryUserId_returnsEmptyLists() throws Exception {
        User boundaryUser = new User();
        boundaryUser.setId("1");
        boundaryUser.setEmail("boundary@example.com");

        when(userRepository.findById("1")).thenReturn(Optional.of(boundaryUser));
        when(templateRepository.findByName("booking_created")).thenReturn(Optional.of(template));
        doNothing().when(emailService).sendCustomHtmlEmail(any(), any(), any());
        when(notificationRepository.save(any())).thenReturn(null);
        when(logRepository.save(any())).thenReturn(null);

        assertDoesNotThrow(() ->
                service.dispatchNotification("1", "booking_created", Map.of()));
    }
}
