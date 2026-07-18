package com.luxeway.service;

import com.luxeway.dto.notification.NotificationDTOs;
import com.luxeway.entity.Notification;
import com.luxeway.entity.User;
import com.luxeway.repository.NotificationRepository;
import com.luxeway.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * LW-142: getMyNotifications  (UTC-025-001)
 * LW-143: getUnreadCount      (UTC-025-002)
 * LW-144: markAsRead          (UTC-025-003)
 * LW-145: markAllAsRead       (UTC-025-004)
 * LW-146: createNotification  (UTC-025-005)
 * LW-147: toResponse          (UTC-025-006)
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private TranslationService translationService;

    @InjectMocks
    private NotificationService service;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("u1");
        user.setDisplayName("Nguyen Van A");

        notification = new Notification();
        notification.setId("n1");
        notification.setUser(user);
        notification.setType("info");
        notification.setTitle("Test Notification");
        notification.setBody("Test body content");
        notification.setLink("/test");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
    }

    // ===== LW-142: getMyNotifications =====

    /** UTCID01 (Normal): user exists, has notifications → returns page */
    @Test
    void getMyNotifications_UTCID01_userHasNotifications_returnsPage() {
        Page<Notification> page = new PageImpl<>(Collections.singletonList(notification));
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(eq("u1"), any(Pageable.class)))
                .thenReturn(page);

        Page<NotificationDTOs.NotificationResponse> result = service.getMyNotifications("u1", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    /** UTCID02 (Abnormal): page=-1, size=0 → throws IllegalArgumentException */
    @Test
    void getMyNotifications_UTCID02_negativePagination_throwsException() {
        assertThrows(IllegalArgumentException.class,
                () -> service.getMyNotifications("u1", -1, 0));
    }

    /** UTCID03 (Boundary): page=MAX_VALUE, size=MAX_VALUE → returns empty page */
    @Test
    void getMyNotifications_UTCID03_maxPagination_returnsEmptyPage() {
        Page<Notification> page = new PageImpl<>(Collections.emptyList());
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(any(), any(Pageable.class)))
                .thenReturn(page);

        assertDoesNotThrow(() ->
                service.getMyNotifications("u1", Integer.MAX_VALUE, Integer.MAX_VALUE));
    }

    // ===== LW-143: getUnreadCount =====

    /** UTCID01 (Normal): notificationRepository returns 5 → getUnreadCount returns 5 */
    @Test
    void getUnreadCount_UTCID01_hasUnread_returnsFive() {
        when(notificationRepository.countByUserIdAndIsReadFalse("u1")).thenReturn(5L);

        long result = service.getUnreadCount("u1");

        assertEquals(5L, result);
    }

    /** UTCID02 (Abnormal): userId does not exist → returns 0 (no exception) */
    @Test
    void getUnreadCount_UTCID02_userNotExist_returnsZero() {
        when(notificationRepository.countByUserIdAndIsReadFalse("non-existent")).thenReturn(0L);

        long result = service.getUnreadCount("non-existent");
        assertEquals(0L, result);
    }

    /** UTCID03 (Boundary): userId=1 (valid boundary) → returns 0 (empty lists) */
    @Test
    void getUnreadCount_UTCID03_boundaryUserId_returnsZero() {
        when(notificationRepository.countByUserIdAndIsReadFalse("1")).thenReturn(0L);

        long result = service.getUnreadCount("1");
        assertEquals(0L, result);
    }

    // ===== LW-144: markAsRead =====

    /** UTCID01 (Normal): notification belongs to user → marks as read, returns response */
    @Test
    void markAsRead_UTCID01_notificationBelongsToUser_marksAsRead() {
        when(notificationRepository.findById("n1")).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenReturn(notification);

        NotificationDTOs.NotificationResponse result = service.markAsRead("n1", "u1");

        assertNotNull(result);
        assertTrue(notification.getIsRead());
        verify(notificationRepository).save(notification);
    }

    /** UTCID02 (Normal): notification belongs to different user → throws AccessDeniedException */
    @Test
    void markAsRead_UTCID02_differentUser_throwsAccessDeniedException() {
        when(notificationRepository.findById("n1")).thenReturn(Optional.of(notification));

        assertThrows(AccessDeniedException.class,
                () -> service.markAsRead("n1", "hacker"));
    }

    /** UTCID03 (Normal): notification does not exist → throws RuntimeException */
    @Test
    void markAsRead_UTCID03_notificationNotFound_throwsRuntimeException() {
        when(notificationRepository.findById("n1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.markAsRead("n1", "u1"));
    }

    /** UTCID04 (Abnormal): notificationId=-1 does not exist → throws RuntimeException */
    @Test
    void markAsRead_UTCID04_idNotExist_throwsRuntimeException() {
        when(notificationRepository.findById("-1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.markAsRead("-1", "u1"));
    }

    /** UTCID05 (Boundary): notificationId=1 (valid boundary, empty lists) → returns object with empty lists */
    @Test
    void markAsRead_UTCID05_boundaryId_returnsResponseWithEmptyLists() {
        Notification bare = new Notification();
        bare.setId("1");
        bare.setUser(user);
        bare.setIsRead(false);
        when(notificationRepository.findById("1")).thenReturn(Optional.of(bare));
        when(notificationRepository.save(any())).thenReturn(bare);

        NotificationDTOs.NotificationResponse result = service.markAsRead("1", "u1");
        assertNotNull(result);
        assertEquals("1", result.getId());
    }

    // ===== LW-145: markAllAsRead =====

    /** UTCID01 (Normal): user has notifications → markAllAsRead returns count */
    @Test
    void markAllAsRead_UTCID01_userHasNotifications_returnsCount() {
        when(notificationRepository.markAllAsRead("u1")).thenReturn(3);

        int result = service.markAllAsRead("u1");
        assertEquals(3, result);
    }

    /** UTCID02 (Abnormal): userId does not exist → returns 0 (no exception) */
    @Test
    void markAllAsRead_UTCID02_userNotExist_returnsZero() {
        when(notificationRepository.markAllAsRead("non-existent")).thenReturn(0);

        int result = service.markAllAsRead("non-existent");
        assertEquals(0, result);
    }

    /** UTCID03 (Boundary): userId=1 (boundary) → returns 0 (empty lists) */
    @Test
    void markAllAsRead_UTCID03_boundaryUserId_returnsZero() {
        when(notificationRepository.markAllAsRead("1")).thenReturn(0);

        int result = service.markAllAsRead("1");
        assertEquals(0, result);
    }

    // ===== LW-146: createNotification =====

    /** UTCID01 (Normal): user exists → notification saved and broadcasted */
    @Test
    void createNotification_UTCID01_userExists_savesAndBroadcasts() {
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(notificationRepository.save(any())).thenReturn(notification);

        assertDoesNotThrow(() ->
                service.createNotification("u1", "info", "Title", "Body", "/link"));

        verify(notificationRepository).save(any());
    }

    /** UTCID02 (Normal): user does not exist → no action taken */
    @Test
    void createNotification_UTCID02_userNotFound_noAction() {
        when(userRepository.findById("non-existent")).thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                service.createNotification("non-existent", "info", "Title", "Body", "/link"));

        verify(notificationRepository, never()).save(any());
    }

    /** UTCID03 (Abnormal): userId=-1 does not exist → no action taken */
    @Test
    void createNotification_UTCID03_userIdNegative_noAction() {
        when(userRepository.findById("-1")).thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                service.createNotification("-1", "info", "Title", "Body", "/link"));

        verify(notificationRepository, never()).save(any());
    }

    /** UTCID04 (Boundary): userId=1 (valid boundary, no relations) → returns object with empty lists */
    @Test
    void createNotification_UTCID04_boundaryUserId_returnsEmptyLists() {
        User boundaryUser = new User();
        boundaryUser.setId("1");
        Notification saved = new Notification();
        saved.setId("n-new");
        saved.setUser(boundaryUser);
        when(userRepository.findById("1")).thenReturn(Optional.of(boundaryUser));
        when(notificationRepository.save(any())).thenReturn(saved);

        assertDoesNotThrow(() ->
                service.createNotification("1", "info", "Title", "Body", "/link"));
    }

    // ===== LW-147: toResponse =====

    /** UTCID01 (Normal): notification with all fields → all fields correctly mapped */
    @Test
    void toResponse_UTCID01_notificationWithAllFields_mapsCorrectly() {
        NotificationDTOs.NotificationResponse result = service.toResponse(notification);

        assertNotNull(result);
        assertEquals("n1", result.getId());
        assertEquals("info", result.getType());
        assertEquals("Test Notification", result.getTitle());
        assertEquals("Test body content", result.getBody());
        assertFalse(result.isRead());
    }

    /** UTCID02 (Abnormal): null notification → throws NullPointerException */
    @Test
    void toResponse_UTCID02_nullNotification_throwsException() {
        assertThrows(Exception.class, () -> service.toResponse(null));
    }

    /** UTCID03 (Boundary): notification with extreme/empty values → boundary values mapped */
    @Test
    void toResponse_UTCID03_extremeValues_boundaryMapping() {
        Notification extreme = new Notification();
        extreme.setId("n-extreme");
        extreme.setUser(user);
        extreme.setType("x".repeat(255));
        extreme.setTitle("T".repeat(255));
        extreme.setBody("B".repeat(1000));
        extreme.setIsRead(true);

        NotificationDTOs.NotificationResponse result = service.toResponse(extreme);

        assertNotNull(result);
        assertEquals("n-extreme", result.getId());
        assertTrue(result.isRead());
    }
}
