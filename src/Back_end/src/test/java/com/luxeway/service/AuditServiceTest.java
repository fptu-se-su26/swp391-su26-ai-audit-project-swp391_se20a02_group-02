package com.luxeway.service;

import com.luxeway.entity.AuditLog;
import com.luxeway.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditService auditService;

    // =======================================================
    // log()
    // =======================================================

    @Test
    void log_ValidInputs_SavesAuditLog() {
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);

        auditService.log("user1", "UPDATE", "USER", "user2", "old", "new", "127.0.0.1", "Chrome");

        verify(auditLogRepository, times(1)).save(captor.capture());
        AuditLog saved = captor.getValue();
        assertEquals("user1", saved.getUserId());
        assertEquals("UPDATE", saved.getAction());
        assertEquals("USER", saved.getTargetType());
        assertEquals("user2", saved.getTargetId());
        assertEquals("old", saved.getOldValues());
        assertEquals("new", saved.getNewValues());
        assertEquals("127.0.0.1", saved.getIpAddress());
        assertEquals("Chrome", saved.getUserAgent());
        assertNotNull(saved.getCreatedAt());
    }

    // =======================================================
    // getAllLogs()
    // =======================================================

    @Test
    void getAllLogs_ReturnsRepositoryList() {
        AuditLog log1 = AuditLog.builder().id("1").build();
        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(log1));

        List<AuditLog> result = auditService.getAllLogs();
        assertEquals(1, result.size());
        assertEquals("1", result.get(0).getId());
    }

    // =======================================================
    // getLogsByFilter()
    // =======================================================

    @Test
    void getLogsByFilter_FiltersByAllCriteria() {
        AuditLog log1 = AuditLog.builder().userId("user1").action("CREATE").targetType("VEHICLE").build();
        AuditLog log2 = AuditLog.builder().userId("user2").action("UPDATE").targetType("VEHICLE").build();
        AuditLog log3 = AuditLog.builder().userId("user1").action("DELETE").targetType("USER").build();

        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(log1, log2, log3));

        // Filter by userId
        List<AuditLog> res1 = auditService.getLogsByFilter("user1", null, null);
        assertEquals(2, res1.size());

        // Filter by action (case insensitive)
        List<AuditLog> res2 = auditService.getLogsByFilter(null, "update", null);
        assertEquals(1, res2.size());
        assertEquals("user2", res2.get(0).getUserId());

        // Filter by targetType (case insensitive)
        List<AuditLog> res3 = auditService.getLogsByFilter(null, null, "vehicle");
        assertEquals(2, res3.size());

        // Filter by all
        List<AuditLog> res4 = auditService.getLogsByFilter("user1", "create", "vehicle");
        assertEquals(1, res4.size());
    }

    // =======================================================
    // exportAuditLogsCsv()
    // =======================================================

    @Test
    void exportAuditLogsCsv_WithNullFields_ReplacesWithDefaults() {
        AuditLog logWithNulls = AuditLog.builder()
                .id("123")
                .createdAt(LocalDateTime.of(2023, 1, 1, 10, 0))
                .action("CREATE")
                .targetType("SYS")
                // userId, targetId, ipAddress, userAgent are null
                .build();

        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(logWithNulls));

        byte[] csvBytes = auditService.exportAuditLogsCsv(null, null, null);
        String csvContent = new String(csvBytes, StandardCharsets.UTF_8);

        // Header exists
        assertTrue(csvContent.contains("Log ID,Timestamp,User ID,Action,Target Type,Target ID,IP Address,User Agent"));
        // Null userId replaced with SYSTEM
        assertTrue(csvContent.contains("123,2023-01-01T10:00,SYSTEM,CREATE,SYS,,,")); 
    }

    @Test
    void exportAuditLogsCsv_WithComplexUserAgent_EscapesQuotes() {
        AuditLog complexLog = AuditLog.builder()
                .id("456")
                .createdAt(LocalDateTime.of(2023, 1, 1, 10, 0))
                .userId("admin")
                .action("LOGIN")
                .targetType("AUTH")
                .targetId("auth1")
                .ipAddress("192.168.1.1")
                .userAgent("Mozilla/5.0 \"LuxeWay\"")
                .build();

        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(complexLog));

        byte[] csvBytes = auditService.exportAuditLogsCsv(null, null, null);
        String csvContent = new String(csvBytes, StandardCharsets.UTF_8);

        // Quotes should be escaped with double quotes and wrapped in quotes
        assertTrue(csvContent.contains("\"Mozilla/5.0 \"\"LuxeWay\"\"\""));
    }
}
