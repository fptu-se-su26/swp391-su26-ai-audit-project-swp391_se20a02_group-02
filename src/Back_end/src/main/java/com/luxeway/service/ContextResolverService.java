package com.luxeway.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeway.entity.AIConversationContext;
import com.luxeway.entity.AIChatSession;
import com.luxeway.entity.Booking;
import com.luxeway.entity.Vehicle;
import com.luxeway.repository.AIConversationContextRepository;
import com.luxeway.repository.AIChatSessionRepository;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class ContextResolverService {

    private final AIConversationContextRepository contextRepository;
    private final AIChatSessionRepository sessionRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIConversationContext resolveAndSaveContext(String sessionId, String currentPage, String activeVehicleId, String activeBookingId) {
        log.info("Resolving context for session: {}, page: {}, vehicle: {}, booking: {}", sessionId, currentPage, activeVehicleId, activeBookingId);

        AIChatSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            log.warn("Session not found for ID: {}, cannot save context", sessionId);
            return null;
        }

        String resolvedVehicleId = activeVehicleId;
        String resolvedBookingId = activeBookingId;

        // Parse path patterns if vehicleId or bookingId aren't provided
        if (currentPage != null && !currentPage.trim().isEmpty()) {
            if (resolvedVehicleId == null || resolvedVehicleId.trim().isEmpty()) {
                resolvedVehicleId = extractIdFromPath(currentPage, "/cars/([a-zA-Z0-9-]+)");
                if (resolvedVehicleId == null) {
                    resolvedVehicleId = extractIdFromPath(currentPage, "/motorbikes/([a-zA-Z0-9-]+)");
                }
            }
            if (resolvedBookingId == null || resolvedBookingId.trim().isEmpty()) {
                resolvedBookingId = extractIdFromPath(currentPage, "/car-booking/([a-zA-Z0-9-]+)");
                if (resolvedBookingId == null) {
                    resolvedBookingId = extractIdFromPath(currentPage, "/motorbike-booking/([a-zA-Z0-9-]+)");
                }
            }
        }

        // Build metadata JSON map
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("resolvedAt", LocalDateTime.now().toString());

        if (resolvedVehicleId != null && !resolvedVehicleId.trim().isEmpty()) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(resolvedVehicleId);
            if (vehicleOpt.isPresent()) {
                Vehicle v = vehicleOpt.get();
                metadata.put("vehicleName", v.getName());
                metadata.put("vehicleBrand", v.getBrand());
                metadata.put("vehicleModel", v.getModel());
                metadata.put("vehicleType", v.getVehicleType().toString());
                metadata.put("vehiclePricePerDay", v.getPricePerDay());
                // Update session state directly
                session.setVehicleId(v.getId());
            }
        }

        if (resolvedBookingId != null && !resolvedBookingId.trim().isEmpty()) {
            Optional<Booking> bookingOpt = bookingRepository.findById(resolvedBookingId);
            if (bookingOpt.isPresent()) {
                Booking b = bookingOpt.get();
                metadata.put("bookingStatus", b.getStatus().toString());
                metadata.put("bookingStartDate", b.getStartDate().toString());
                metadata.put("bookingEndDate", b.getEndDate().toString());
                metadata.put("bookingTotal", b.getTotal());
                if (b.getVehicle() != null) {
                    metadata.put("bookingVehicleName", b.getVehicle().getName());
                    metadata.put("bookingVehicleType", b.getVehicle().getVehicleType().toString());
                }
                // Update session state directly
                session.setBookingId(b.getId());
            }
        }

        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);

        String metadataJson = null;
        try {
            metadataJson = objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            log.error("Error writing context metadata JSON", e);
        }

        // Fetch or create AIConversationContext
        AIConversationContext context = contextRepository.findBySessionId(sessionId)
                .orElse(AIConversationContext.builder().session(session).build());

        context.setCurrentPage(currentPage);
        context.setActiveVehicleId(resolvedVehicleId);
        context.setActiveBookingId(resolvedBookingId);
        context.setResolvedMetadata(metadataJson);

        return contextRepository.save(context);
    }

    private String extractIdFromPath(String path, String regex) {
        try {
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(path);
            if (matcher.find()) {
                return matcher.group(1);
            }
        } catch (Exception e) {
            log.error("Regex matching error on path: {} with regex: {}", path, regex, e);
        }
        return null;
    }
}
