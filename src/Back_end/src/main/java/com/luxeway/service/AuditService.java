package com.luxeway.service;

import com.luxeway.entity.AuditLog;
import com.luxeway.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String userId, String action, String targetType, String targetId, 
                    String oldValues, String newValues, String ipAddress, String userAgent) {
        
        log.info("Audit log event: user={}, action={}, target={}", userId, action, targetType);
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .oldValues(oldValues)
                .newValues(newValues)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .build();
        
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<AuditLog> getLogsByFilter(String userId, String action, String targetType) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(log -> userId == null || userId.equals(log.getUserId()))
                .filter(log -> action == null || action.equalsIgnoreCase(log.getAction()))
                .filter(log -> targetType == null || targetType.equalsIgnoreCase(log.getTargetType()))
                .collect(Collectors.toList());
    }

    public byte[] exportAuditLogsCsv(String userId, String action, String targetType) {
        List<AuditLog> logs = getLogsByFilter(userId, action, targetType);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Log ID,Timestamp,User ID,Action,Target Type,Target ID,IP Address,User Agent\n");
        
        for (AuditLog l : logs) {
            csv.append(l.getId()).append(",")
               .append(l.getCreatedAt()).append(",")
               .append(l.getUserId() != null ? l.getUserId() : "SYSTEM").append(",")
               .append(l.getAction()).append(",")
               .append(l.getTargetType()).append(",")
               .append(l.getTargetId() != null ? l.getTargetId() : "").append(",")
               .append(l.getIpAddress() != null ? l.getIpAddress() : "").append(",")
               .append(l.getUserAgent() != null ? "\"" + l.getUserAgent().replace("\"", "\"\"") + "\"" : "")
               .append("\n");
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
