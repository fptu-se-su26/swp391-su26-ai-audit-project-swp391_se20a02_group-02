package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.*;
import com.luxeway.repository.*;
import com.luxeway.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
@Tag(name = "LuxeWay Support Ecosystem", description = "Endpoints for AI concierge, KB, emergency, status, and tickets")
public class SupportEcosystemController {

    private final GeminiService geminiService;
    private final AIChatSessionRepository chatSessionRepository;
    private final AIChatMessageRepository chatMessageRepository;
    private final KnowledgeCategoryRepository knowledgeCategoryRepository;
    private final KnowledgeArticleRepository knowledgeArticleRepository;
    private final SupportTicketV2Repository ticketV2Repository;
    private final SupportMessageV2Repository messageV2Repository;
    private final EmergencyReportRepository emergencyReportRepository;
    private final DeliveryTrackingRepository deliveryTrackingRepository;
    private final DeliveryTrackingHistoryRepository deliveryTrackingHistoryRepository;
    private final ServiceStatusRepository serviceStatusRepository;
    private final OwnerSupportRequestRepository ownerSupportRequestRepository;
    private final SupportCategoryRepository supportCategoryRepository;
    private final SupportPriorityRepository supportPriorityRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    // ==========================================
    // 1. AI CONCIERGE CHAT ENDPOINTS
    // ==========================================

    @PostMapping("/ai/chat")
    @Operation(summary = "Send chat message to AI Concierge")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chatWithAI(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        String message = body.get("message");

        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }

        String userId = (user != null) ? user.getId() : null;
        Map<String, Object> aiResponse = geminiService.generateChatResponse(sessionId, message, userId);

        return ResponseEntity.ok(ApiResponse.success("AI response generated", aiResponse));
    }

    @GetMapping("/ai/sessions")
    @Operation(summary = "Get list of chat sessions for authenticated user")
    public ResponseEntity<ApiResponse<List<AIChatSession>>> getAISessions(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }
        List<AIChatSession> sessions = chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.success("AI sessions loaded", sessions));
    }

    @GetMapping("/ai/sessions/{id}/messages")
    @Operation(summary = "Get chat messages for an AI session")
    public ResponseEntity<ApiResponse<List<AIChatMessage>>> getAISessionMessages(
            @PathVariable String id) {
        List<AIChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(ApiResponse.success("AI messages loaded", messages));
    }

    @PostMapping("/ai/sessions/{id}/context")
    @Operation(summary = "Update context (bookingId/vehicleId) for an AI session")
    public ResponseEntity<ApiResponse<AIChatSession>> updateSessionContext(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        AIChatSession session = chatSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found: " + id));

        if (body.containsKey("bookingId")) {
            session.setBookingId(body.get("bookingId"));
        }
        if (body.containsKey("vehicleId")) {
            session.setVehicleId(body.get("vehicleId"));
        }

        session.setUpdatedAt(LocalDateTime.now());
        AIChatSession saved = chatSessionRepository.save(session);
        return ResponseEntity.ok(ApiResponse.success("AI session context updated", saved));
    }

    // ==========================================
    // 2. KNOWLEDGE BASE ENDPOINTS
    // ==========================================

    @GetMapping("/kb/categories")
    @Operation(summary = "Get all knowledge base categories")
    public ResponseEntity<ApiResponse<List<KnowledgeCategory>>> getKBCategories() {
        List<KnowledgeCategory> categories = knowledgeCategoryRepository.findAll();
        // Sort by display order
        categories.sort(Comparator.comparingInt(KnowledgeCategory::getDisplayOrder));
        return ResponseEntity.ok(ApiResponse.success("Knowledge categories loaded", categories));
    }

    @GetMapping("/kb/articles")
    @Operation(summary = "Get articles filtered by category or search query")
    public ResponseEntity<ApiResponse<List<KnowledgeArticle>>> getKBArticles(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String query) {
        List<KnowledgeArticle> articles;
        if (query != null && !query.trim().isEmpty()) {
            articles = knowledgeArticleRepository.searchArticles(query);
        } else if (categoryId != null) {
            articles = knowledgeArticleRepository.findByCategoryIdAndIsPublishedTrueOrderByTitleAsc(categoryId);
        } else {
            articles = knowledgeArticleRepository.findAll();
        }
        // Filter published
        articles.removeIf(a -> !Boolean.TRUE.equals(a.getIsPublished()));
        return ResponseEntity.ok(ApiResponse.success("Knowledge articles loaded", articles));
    }

    @GetMapping("/kb/articles/{slug}")
    @Operation(summary = "Get article detail and increment view count")
    public ResponseEntity<ApiResponse<KnowledgeArticle>> getKBArticleBySlug(
            @PathVariable String slug) {
        KnowledgeArticle article = knowledgeArticleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found: " + slug));

        article.setViewCount(article.getViewCount() + 1);
        knowledgeArticleRepository.save(article);

        return ResponseEntity.ok(ApiResponse.success("Knowledge article loaded", article));
    }

    @PostMapping("/kb/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new knowledge category (Admin only)")
    public ResponseEntity<ApiResponse<KnowledgeCategory>> createKBCategory(
            @RequestBody KnowledgeCategory category) {
        KnowledgeCategory saved = knowledgeCategoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success("Category created", saved));
    }

    @PostMapping("/kb/articles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new knowledge article (Admin only)")
    public ResponseEntity<ApiResponse<KnowledgeArticle>> createKBArticle(
            @RequestBody KnowledgeArticle article) {
        if (article.getId() == null) {
            article.setId(UUID.randomUUID().toString());
        }
        KnowledgeCategory cat = knowledgeCategoryRepository.findById(article.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        article.setCategory(cat);
        KnowledgeArticle saved = knowledgeArticleRepository.save(article);
        return ResponseEntity.ok(ApiResponse.success("Article created", saved));
    }

    // ==========================================
    // 3. SUPPORT TICKETS V2 ENDPOINTS
    // ==========================================

    @PostMapping("/tickets-v2")
    @Operation(summary = "Create a new support ticket")
    public ResponseEntity<ApiResponse<SupportTicketV2>> createTicketV2(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }

        String subject = (String) body.get("subject");
        String description = (String) body.get("description");
        String bookingId = (String) body.get("bookingId");
        String vehicleId = (String) body.get("vehicleId");

        // Category lookup
        SupportCategory category = null;
        if (body.containsKey("categoryId")) {
            Object catVal = body.get("categoryId");
            if (catVal instanceof Integer) {
                category = supportCategoryRepository.findById((Integer) catVal).orElse(null);
            } else if (catVal instanceof String) {
                category = supportCategoryRepository.findByName((String) catVal)
                        .orElseGet(() -> supportCategoryRepository.findById(Integer.parseInt((String) catVal)).orElse(null));
            }
        }
        if (category == null) {
            // Default to OTHER
            category = supportCategoryRepository.findByName("OTHER")
                    .orElseThrow(() -> new RuntimeException("Default category not found"));
        }

        // Priority lookup
        SupportPriority priority = null;
        if (body.containsKey("priorityId")) {
            Object priVal = body.get("priorityId");
            if (priVal instanceof Integer) {
                priority = supportPriorityRepository.findById((Integer) priVal).orElse(null);
            } else if (priVal instanceof String) {
                priority = supportPriorityRepository.findByName((String) priVal)
                        .orElseGet(() -> supportPriorityRepository.findById(Integer.parseInt((String) priVal)).orElse(null));
            }
        }
        if (priority == null) {
            // Default to NORMAL
            priority = supportPriorityRepository.findByName("NORMAL")
                    .orElseThrow(() -> new RuntimeException("Default priority not found"));
        }

        LocalDateTime deadline = LocalDateTime.now().plusHours(priority.getResponseTimeHours());

        SupportTicketV2 ticket = SupportTicketV2.builder()
                .user(user)
                .bookingId(bookingId)
                .vehicleId(vehicleId)
                .subject(subject)
                .description(description)
                .category(category)
                .priority(priority)
                .status("OPEN")
                .slaDeadline(deadline)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        SupportTicketV2 savedTicket = ticketV2Repository.save(ticket);

        // Add first message using ticket description
        SupportMessageV2 firstMsg = SupportMessageV2.builder()
                .ticket(savedTicket)
                .sender(user)
                .senderRole("CUSTOMER")
                .body(description)
                .createdAt(LocalDateTime.now())
                .build();
        messageV2Repository.save(firstMsg);

        return ResponseEntity.ok(ApiResponse.success("Ticket created successfully", savedTicket));
    }

    @GetMapping("/tickets-v2/my")
    @Operation(summary = "Get support tickets for logged-in user")
    public ResponseEntity<ApiResponse<List<SupportTicketV2>>> getMyTicketsV2(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }
        List<SupportTicketV2> tickets = ticketV2Repository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Tickets loaded", tickets));
    }

    @GetMapping("/tickets-v2/{id}")
    @Operation(summary = "Get ticket detail and message thread")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTicketV2(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }

        SupportTicketV2 ticket = ticketV2Repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to ticket");
        }

        List<SupportMessageV2> messages = messageV2Repository.findByTicketIdOrderByCreatedAtAsc(id);

        Map<String, Object> response = new HashMap<>();
        response.put("ticket", ticket);
        response.put("messages", messages);

        return ResponseEntity.ok(ApiResponse.success("Ticket details loaded", response));
    }

    @PostMapping("/tickets-v2/{id}/messages")
    @Operation(summary = "Send a message/reply to a support ticket")
    public ResponseEntity<ApiResponse<SupportMessageV2>> replyToTicketV2(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }

        SupportTicketV2 ticket = ticketV2Repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to reply to this ticket");
        }

        String role = isAdmin ? "AGENT" : "CUSTOMER";
        String content = body.containsKey("content") ? body.get("content") : body.get("body");

        SupportMessageV2 reply = SupportMessageV2.builder()
                .ticket(ticket)
                .sender(user)
                .senderRole(role)
                .body(content)
                .createdAt(LocalDateTime.now())
                .build();

        SupportMessageV2 saved = messageV2Repository.save(reply);

        // Update ticket updatedAt timestamp
        ticket.setUpdatedAt(LocalDateTime.now());
        if (isAdmin) {
            ticket.setStatus("IN_PROGRESS");
        } else {
            ticket.setStatus("OPEN");
        }
        ticketV2Repository.save(ticket);

        // Broadcast to WebSocket topic
        try {
            messagingTemplate.convertAndSend("/topic/tickets-v2/" + id, saved);
        } catch (Exception e) {
            log.warn("Failed to broadcast ticket message update: {}", e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success("Reply sent", saved));
    }

    @GetMapping("/tickets-v2")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all support tickets (Admin only)")
    public ResponseEntity<ApiResponse<List<SupportTicketV2>>> getAllTicketsV2() {
        List<SupportTicketV2> tickets = ticketV2Repository.findAll();
        tickets.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));
        return ResponseEntity.ok(ApiResponse.success("All tickets loaded", tickets));
    }

    // ==========================================
    // 4. EMERGENCY DISPATCH ENDPOINTS
    // ==========================================

    @PostMapping("/emergency")
    @Operation(summary = "Submit a priority emergency dispatch ticket")
    public ResponseEntity<ApiResponse<EmergencyReport>> submitEmergency(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }

        String emergencyType = (String) body.get("emergencyType");
        String description = (String) body.get("description");
        String contactPhone = (String) body.get("contactPhone");
        String bookingId = (String) body.get("bookingId");
        String vehicleId = (String) body.get("vehicleId");

        BigDecimal lat = null;
        BigDecimal lng = null;
        if (body.containsKey("latitude") && body.get("latitude") != null) {
            lat = new BigDecimal(body.get("latitude").toString());
        }
        if (body.containsKey("longitude") && body.get("longitude") != null) {
            lng = new BigDecimal(body.get("longitude").toString());
        }

        EmergencyReport report = EmergencyReport.builder()
                .user(user)
                .bookingId(bookingId)
                .vehicleId(vehicleId)
                .emergencyType(emergencyType)
                .description(description)
                .contactPhone(contactPhone)
                .latitude(lat)
                .longitude(lng)
                .status("REPORTED")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        EmergencyReport saved = emergencyReportRepository.save(report);

        // Broadcast notification to Admin Dashboard for instant priority sound alerts
        try {
            messagingTemplate.convertAndSend("/topic/emergency-alerts", saved);
        } catch (Exception e) {
            log.warn("Failed to broadcast emergency alert: {}", e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success("Emergency report submitted. Support responder will contact you immediately.", saved));
    }

    @GetMapping("/emergency/my")
    @Operation(summary = "Get emergency tickets for logged-in user")
    public ResponseEntity<ApiResponse<List<EmergencyReport>>> getMyEmergencies(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }
        List<EmergencyReport> reports = emergencyReportRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Emergency reports loaded", reports));
    }

    @GetMapping("/emergency")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all active emergency reports (Admin only)")
    public ResponseEntity<ApiResponse<List<EmergencyReport>>> getAllEmergencies() {
        List<EmergencyReport> reports = emergencyReportRepository.findAll();
        reports.sort((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()));
        return ResponseEntity.ok(ApiResponse.success("All emergency reports loaded", reports));
    }

    // ==========================================
    // 5. GOONG MAPS DELIVERY SIMULATOR ENDPOINTS
    // ==========================================

    @PostMapping("/delivery/tracking")
    @Operation(summary = "Initialize delivery tracking simulation for a booking")
    public ResponseEntity<ApiResponse<DeliveryTracking>> initializeDeliveryTracking(
            @RequestBody Map<String, String> body) {
        String bookingId = body.get("bookingId");
        if (bookingId == null || bookingId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("bookingId is required"));
        }

        Optional<DeliveryTracking> existing = deliveryTrackingRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Delivery tracking session active", existing.get()));
        }

        // Load Booking info
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User owner = booking.getOwner();
        User renter = booking.getRenter();

        // Coordinates in Hanoi (Goong JS default mock area)
        // Vehicle starts at owner's spot, renter is at renter's spot.
        // Let's seed:
        // Owner/Vehicle start spot: 21.0285, 105.8542 (Hoan Kiem Lake)
        // Renter destination spot: 21.0333, 105.8456 (Hanoi train station area)
        BigDecimal vehicleLat = new BigDecimal("21.02851234");
        BigDecimal vehicleLng = new BigDecimal("105.85421234");
        BigDecimal renterLat = new BigDecimal("21.03339876");
        BigDecimal renterLng = new BigDecimal("105.84569876");

        DeliveryTracking tracking = DeliveryTracking.builder()
                .bookingId(bookingId)
                .owner(owner)
                .renter(renter)
                .status("EN_ROUTE")
                .latitude(vehicleLat)
                .longitude(vehicleLng)
                .vehicleLatitude(vehicleLat)
                .vehicleLongitude(vehicleLng)
                .renterLatitude(renterLat)
                .renterLongitude(renterLng)
                .eta(LocalDateTime.now().plusMinutes(15))
                .distanceKm(new BigDecimal("3.50"))
                .speedKmh(new BigDecimal("22.40"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        DeliveryTracking saved = deliveryTrackingRepository.save(tracking);

        // Save starting point in history
        DeliveryTrackingHistory startPoint = DeliveryTrackingHistory.builder()
                .tracking(saved)
                .latitude(vehicleLat)
                .longitude(vehicleLng)
                .recordedAt(LocalDateTime.now())
                .build();
        deliveryTrackingHistoryRepository.save(startPoint);

        return ResponseEntity.ok(ApiResponse.success("Delivery tracking initialized", saved));
    }

    @GetMapping("/delivery/tracking/{bookingId}")
    @Operation(summary = "Get current delivery tracking information")
    public ResponseEntity<ApiResponse<DeliveryTracking>> getDeliveryTracking(
            @PathVariable String bookingId) {
        DeliveryTracking tracking = deliveryTrackingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No active tracking session for booking: " + bookingId));
        return ResponseEntity.ok(ApiResponse.success("Delivery tracking loaded", tracking));
    }

    @PostMapping("/delivery/tracking/{bookingId}/step")
    @Operation(summary = "Simulate a live vehicle position update step")
    public ResponseEntity<ApiResponse<DeliveryTracking>> simulateTrackingStep(
            @PathVariable String bookingId) {
        DeliveryTracking tracking = deliveryTrackingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No active tracking session for booking: " + bookingId));

        if ("COMPLETED".equals(tracking.getStatus()) || "ARRIVED".equals(tracking.getStatus())) {
            return ResponseEntity.ok(ApiResponse.success("Delivery already completed", tracking));
        }

        BigDecimal driverLat = tracking.getLatitude();
        BigDecimal driverLng = tracking.getLongitude();
        BigDecimal renterLat = tracking.getRenterLatitude();
        BigDecimal renterLng = tracking.getRenterLongitude();

        // Calculate delta (move 25% closer)
        BigDecimal pct = new BigDecimal("0.25");
        BigDecimal newLat = driverLat.add(renterLat.subtract(driverLat).multiply(pct)).setScale(8, RoundingMode.HALF_UP);
        BigDecimal newLng = driverLng.add(renterLng.subtract(driverLng).multiply(pct)).setScale(8, RoundingMode.HALF_UP);

        tracking.setLatitude(newLat);
        tracking.setLongitude(newLng);
        tracking.setUpdatedAt(LocalDateTime.now());

        // Shrink distance and ETA
        BigDecimal newDist = tracking.getDistanceKm().multiply(new BigDecimal("0.75")).setScale(2, RoundingMode.HALF_UP);
        tracking.setDistanceKm(newDist);

        if (newDist.compareTo(new BigDecimal("0.10")) <= 0) {
            tracking.setStatus("ARRIVED");
            tracking.setDistanceKm(BigDecimal.ZERO);
            tracking.setSpeedKmh(BigDecimal.ZERO);
            tracking.setEta(null);
        } else {
            tracking.setEta(LocalDateTime.now().plusMinutes(Math.max(1, (int)(newDist.doubleValue() * 4))));
            // Random speed fluctuation
            double randomSpeed = 15.0 + (Math.random() * 15.0);
            tracking.setSpeedKmh(new BigDecimal(randomSpeed).setScale(2, RoundingMode.HALF_UP));
        }

        DeliveryTracking saved = deliveryTrackingRepository.save(tracking);

        // Record history coordinate
        DeliveryTrackingHistory checkpoint = DeliveryTrackingHistory.builder()
                .tracking(saved)
                .latitude(newLat)
                .longitude(newLng)
                .recordedAt(LocalDateTime.now())
                .build();
        deliveryTrackingHistoryRepository.save(checkpoint);

        // Broadcast updated coordinates to client page in real-time
        try {
            messagingTemplate.convertAndSend("/topic/delivery/" + bookingId, saved);
        } catch (Exception e) {
            log.warn("Failed to broadcast delivery coordinates: {}", e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success("Delivery coordinates updated", saved));
    }

    // ==========================================
    // 6. PLATFORM STATUS MONITOR ENDPOINTS
    // ==========================================

    @GetMapping("/status")
    @Operation(summary = "Get status of all LuxeWay services")
    public ResponseEntity<ApiResponse<List<ServiceStatus>>> getPlatformStatus() {
        List<ServiceStatus> statuses = serviceStatusRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Platform service status loaded", statuses));
    }

    @PostMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update status of a service (Admin only)")
    public ResponseEntity<ApiResponse<ServiceStatus>> updatePlatformStatus(
            @RequestBody Map<String, String> body) {
        String serviceName = body.get("serviceName");
        String status = body.get("status");
        String description = body.get("description");

        ServiceStatus service = serviceStatusRepository.findByServiceName(serviceName)
                .orElseGet(() -> ServiceStatus.builder().serviceName(serviceName).build());

        service.setStatus(status);
        service.setDescription(description);
        service.setLastUpdated(LocalDateTime.now());

        ServiceStatus saved = serviceStatusRepository.save(service);
        return ResponseEntity.ok(ApiResponse.success("Platform status updated", saved));
    }

    // ==========================================
    // 7. OWNER SUCCESS DASHBOARD ENDPOINTS
    // ==========================================

    @PostMapping("/owner/requests")
    @Operation(summary = "Submit a support request to Owner Success hub")
    public ResponseEntity<ApiResponse<OwnerSupportRequest>> submitOwnerRequest(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }

        String requestType = body.get("requestType");
        String subject = body.get("subject");
        String details = body.get("details");

        OwnerSupportRequest request = OwnerSupportRequest.builder()
                .owner(user)
                .requestType(requestType)
                .subject(subject)
                .details(details)
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build();

        OwnerSupportRequest saved = ownerSupportRequestRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success("Support request registered with Host Relations", saved));
    }

    @GetMapping("/owner/requests")
    @Operation(summary = "Get list of Host Relations requests for active owner")
    public ResponseEntity<ApiResponse<List<OwnerSupportRequest>>> getMyOwnerRequests(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }
        List<OwnerSupportRequest> requests = ownerSupportRequestRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner support requests loaded", requests));
    }
}
