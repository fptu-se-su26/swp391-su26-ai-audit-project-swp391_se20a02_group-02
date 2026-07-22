package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.DigitalContract;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.DigitalContractRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@SuppressWarnings("all")
public class DigitalContractService {

    @Autowired
    private DigitalContractRepository contractRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${docuseal.base-url:https://api.docuseal.com}")
    private String docusealBaseUrl;

    @Value("${docuseal.api-token:}")
    private String docusealApiToken;

    @Value("${docuseal.template-id:}")
    private String docusealTemplateId;

    @Value("${docuseal.embedding-url:}")
    private String docusealEmbeddingUrl;

    @Value("${docuseal.renter-role:Renter}")
    private String docusealRenterRole;

    @Value("${docuseal.owner-role:Owner}")
    private String docusealOwnerRole;

    @Value("${docuseal.send-email:false}")
    private boolean docusealSendEmail;

    @Transactional
    public DigitalContract createContract(String bookingId, String documentUrl, String requesterId, boolean isAdmin) {
        Booking booking = bookingRepository.findByIdForContractUpdate(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to create contract for this booking");
        }
        
        Optional<DigitalContract> existing = contractRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            DigitalContract contract = existing.get();
            refreshOrCreateDocuSealSubmission(contract, booking);
            return withCurrentSignerUrl(contractRepository.save(contract), requesterId);
        }

        return createNewContractForLockedBooking(booking, documentUrl, requesterId);
    }

    @Transactional(readOnly = false)
    public DigitalContract getContractByBooking(String bookingId, String requesterId, boolean isAdmin) {
        Optional<DigitalContract> contractOpt = contractRepository.findByBookingId(bookingId);
        if (contractOpt.isPresent()) {
            DigitalContract contract = contractOpt.get();
            Booking booking = contract.getBooking();
            if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
                throw new org.springframework.security.access.AccessDeniedException("Not authorized to view contract for this booking");
            }
            refreshDocuSealStatus(contract);
            return withCurrentSignerUrl(contractRepository.save(contract), requesterId);
        }
        return null;
    }

    @Transactional
    public DigitalContract ensureContract(String bookingId, String documentUrl, String requesterId, boolean isAdmin) {
        Booking booking = bookingRepository.findByIdForContractUpdate(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view contract for this booking");
        }

        Optional<DigitalContract> existing = contractRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            DigitalContract contract = existing.get();
            refreshOrCreateDocuSealSubmission(contract, booking);
            return withCurrentSignerUrl(contractRepository.save(contract), requesterId);
        }

        String resolvedDocumentUrl = documentUrl;
        if (resolvedDocumentUrl == null || resolvedDocumentUrl.isBlank()) {
            resolvedDocumentUrl = "/contracts/" + bookingId;
        }
        return createNewContractForLockedBooking(booking, resolvedDocumentUrl, requesterId);
    }

    private DigitalContract createNewContractForLockedBooking(Booking booking, String documentUrl, String requesterId) {
        String resolvedDocumentUrl = documentUrl;
        if (resolvedDocumentUrl == null || resolvedDocumentUrl.isBlank()) {
            resolvedDocumentUrl = "/contracts/" + booking.getId();
        }

        DigitalContract contract = DigitalContract.builder()
                .booking(booking)
                .documentUrl(resolvedDocumentUrl)
                .build();

        updateContractWorkflowStatus(contract);
        createDocuSealSubmissionIfConfigured(contract, booking);
        try {
            return withCurrentSignerUrl(contractRepository.saveAndFlush(contract), requesterId);
        } catch (DataIntegrityViolationException duplicate) {
            DigitalContract existing = contractRepository.findByBookingId(booking.getId())
                    .orElseThrow(() -> duplicate);
            refreshOrCreateDocuSealSubmission(existing, booking);
            return withCurrentSignerUrl(contractRepository.save(existing), requesterId);
        }
    }

    private void refreshOrCreateDocuSealSubmission(DigitalContract contract, Booking booking) {
        if (contract.getDocusealSubmissionId() == null && isDocuSealConfigured()) {
            createDocuSealSubmissionIfConfigured(contract, booking);
        } else {
            refreshDocuSealStatus(contract);
        }
        updateContractWorkflowStatus(contract);
    }

    @Transactional
    public DigitalContract signContract(Long contractId, String userId, String signature) {
        if (signature == null || signature.isBlank()) {
            throw new RuntimeException("Signature is required");
        }

        DigitalContract contract = contractRepository.findById(contractId).orElseThrow(() -> new RuntimeException("Contract not found"));
        Booking booking = contract.getBooking();

        if (booking.getOwner().getId().equals(userId)) {
            contract.setOwnerSignature(signature);
            contract.setOwnerSignedAt(LocalDateTime.now());
        } else if (booking.getRenter().getId().equals(userId)) {
            contract.setRenterSignature(signature);
            contract.setRenterSignedAt(LocalDateTime.now());
        } else {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to sign this contract");
        }

        contract.checkAndSetFullySigned();
        updateContractWorkflowStatus(contract);
        return contractRepository.save(contract);
    }

    @Transactional
    public DigitalContract signContract(Long contractId, String userId, String signature, boolean isOwner) {
        if (signature == null || signature.isBlank()) {
            throw new RuntimeException("Signature is required");
        }

        DigitalContract contract = contractRepository.findById(contractId).orElseThrow(() -> new RuntimeException("Contract not found"));
        Booking booking = contract.getBooking();

        if (isOwner) {
            if (!booking.getOwner().getId().equals(userId)) throw new RuntimeException("User is not the owner");
            contract.setOwnerSignature(signature);
            contract.setOwnerSignedAt(LocalDateTime.now());
        } else {
            if (!booking.getRenter().getId().equals(userId)) throw new RuntimeException("User is not the renter");
            contract.setRenterSignature(signature);
            contract.setRenterSignedAt(LocalDateTime.now());
        }

        contract.checkAndSetFullySigned();
        updateContractWorkflowStatus(contract);
        return contractRepository.save(contract);
    }

    private boolean isDocuSealConfigured() {
        return docusealApiToken != null && !docusealApiToken.isBlank()
                && docusealTemplateId != null && !docusealTemplateId.isBlank();
    }

    private DigitalContract withCurrentSignerUrl(DigitalContract contract, String userId) {
        Booking booking = contract.getBooking();
        if (booking.getOwner().getId().equals(userId)) {
            contract.setCurrentSignerEmbedUrl(contract.getDocusealOwnerEmbedUrl());
        } else if (booking.getRenter().getId().equals(userId)) {
            contract.setCurrentSignerEmbedUrl(contract.getDocusealRenterEmbedUrl());
        }
        return contract;
    }

    private void createDocuSealSubmissionIfConfigured(DigitalContract contract, Booking booking) {
        if (!isDocuSealConfigured()) {
            clearDocuSealSigningUrls(contract);
            updateContractWorkflowStatus(contract, "not_configured");
            return;
        }
        if (contract.getDocusealSubmissionId() != null) {
            return;
        }

        try {
            JsonNode template = fetchDocuSealTemplate();
            if (template.has("fields") && template.path("fields").isArray() && template.path("fields").isEmpty()) {
                throw new RuntimeException("DocuSeal template does not contain signing fields.");
            }

            List<Map<String, Object>> submitters = buildDocuSealSubmitters(booking, template);
            if (submitters.isEmpty()) {
                throw new RuntimeException("DocuSeal template does not contain a configured renter or owner role.");
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("template_id", Long.parseLong(docusealTemplateId.trim()));
            payload.put("send_email", docusealSendEmail);
            payload.put("submitters", submitters);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(trimTrailingSlash(docusealBaseUrl) + "/submissions"))
                    .header("Content-Type", "application/json")
                    .header("X-Auth-Token", docusealApiToken)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("DocuSeal create submission failed with HTTP " + response.statusCode() + ": " + safeDocuSealBody(response.body()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            applyDocuSealSubmitters(contract, root);
            if (contract.getDocusealSubmissionId() == null) {
                throw new RuntimeException("DocuSeal response did not include a submission id.");
            }
            updateContractWorkflowStatus(contract);
        } catch (Exception e) {
            clearDocuSealSigningUrls(contract);
            updateContractWorkflowStatus(contract, "configuration_error");
        }
    }

    private JsonNode fetchDocuSealTemplate() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(trimTrailingSlash(docusealBaseUrl) + "/templates/" + docusealTemplateId.trim()))
                .header("X-Auth-Token", docusealApiToken)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("DocuSeal template check failed with HTTP " + response.statusCode() + ": " + safeDocuSealBody(response.body()));
        }
        return objectMapper.readTree(response.body());
    }

    private void clearDocuSealSigningUrls(DigitalContract contract) {
        contract.setDocusealRenterEmbedUrl(null);
        contract.setDocusealOwnerEmbedUrl(null);
        contract.setCurrentSignerEmbedUrl(null);
    }

    private void clearDocuSealSubmission(DigitalContract contract) {
        contract.setDocusealSubmissionId(null);
        contract.setDocusealRenterSubmitterId(null);
        contract.setDocusealOwnerSubmitterId(null);
        clearDocuSealSigningUrls(contract);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private List<Map<String, Object>> buildDocuSealSubmitters(Booking booking, JsonNode template) {
        List<Map<String, Object>> submitters = new ArrayList<>();
        List<String> templateRoles = templateSubmitterRoles(template);
        if (templateRoles.isEmpty() || templateRoles.contains(docusealRenterRole)) {
            submitters.add(buildSubmitter(
                    docusealRenterRole,
                    safeText(booking.getRenter().getEmail(), "renter@luxeway.vn"),
                    safeText(booking.getRenterName(), booking.getRenter().getDisplayName(), booking.getRenter().getEmail(), "LuxeWay Renter"),
                    booking));
        }
        if (templateRoles.isEmpty() || templateRoles.contains(docusealOwnerRole)) {
            submitters.add(buildSubmitter(
                    docusealOwnerRole,
                    safeText(booking.getOwner().getEmail(), "owner@luxeway.vn"),
                    safeText(booking.getOwnerName(), booking.getOwner().getDisplayName(), booking.getOwner().getEmail(), "LuxeWay Owner"),
                    booking));
        }
        return submitters;
    }

    private List<String> templateSubmitterRoles(JsonNode template) {
        List<String> roles = new ArrayList<>();
        JsonNode submitters = template.path("submitters");
        if (!submitters.isArray()) {
            return roles;
        }
        for (JsonNode submitter : submitters) {
            String role = text(submitter, "name", "role");
            if (role != null) {
                roles.add(role);
            }
        }
        return roles;
    }

    private Map<String, Object> buildSubmitter(String role, String email, String name, Booking booking) {
        Map<String, Object> submitter = new HashMap<>();
        submitter.put("role", role);
        submitter.put("email", email);
        submitter.put("name", name);
        submitter.put("external_id", booking.getId() + ":" + role);
        submitter.put("completed_redirect_url", trimTrailingSlash(resolveFrontendUrl()) + "/booking/" + booking.getId() + "/contract?signed=docuseal");

        Map<String, Object> values = new HashMap<>();
        String bookingCode = booking.getBookingCode() != null ? booking.getBookingCode() : booking.getId();
        String renterName = safeText(booking.getRenterName(), booking.getRenter().getDisplayName(), booking.getRenter().getEmail());
        String ownerName = safeText(booking.getOwnerName(), booking.getOwner().getDisplayName(), booking.getOwner().getEmail());
        String renterEmail = safeText(booking.getRenter().getEmail(), "renter@luxeway.vn");
        String ownerEmail = safeText(booking.getOwner().getEmail(), "owner@luxeway.vn");
        String renterPhone = safeText(booking.getRenter().getPhone(), "Not provided");
        String ownerPhone = safeText(booking.getOwner().getPhone(), "Not provided");
        String renterAddress = safeText(booking.getRenter().getLocation(), booking.getDeliveryAddress(), booking.getPickupLocation(), "Not provided");
        String ownerAddress = safeText(booking.getOwner().getLocation(), booking.getPickupLocation(), "Not provided");
        String renterIdentity = safeText(booking.getRenter().getLicenseNumber(), "Not provided");
        String ownerIdentity = safeText(booking.getOwner().getLicenseNumber(), "Not provided");
        String today = String.valueOf(java.time.LocalDate.now());

        values.put("booking_code", bookingCode);
        values.put("contract_code", bookingCode);
        values.put("vehicle_name", safeText(booking.getVehicleName(), "LuxeWay vehicle"));
        values.put("start_date", String.valueOf(booking.getStartDate()));
        values.put("end_date", String.valueOf(booking.getEndDate()));
        values.put("total_days", booking.getTotalDays());
        values.put("total_amount", money(booking.getTotal()));
        values.put("deposit", money(booking.getDeposit()));
        values.put("pickup_location", safeText(booking.getPickupLocation(), "Not provided"));
        values.put("delivery_address", safeText(booking.getDeliveryAddress(), "Not provided"));

        values.put("renter_full_name", renterName);
        values.put("renter_identity_number", renterIdentity);
        values.put("renter_address", renterAddress);
        values.put("renter_phone", renterPhone);
        values.put("renter_email", renterEmail);

        values.put("owner_full_name", ownerName);
        values.put("owner_identity_number", ownerIdentity);
        values.put("owner_address", ownerAddress);
        values.put("owner_phone", ownerPhone);
        values.put("owner_email", ownerEmail);
        submitter.put("values", values);
        return submitter;
    }

    private void applyDocuSealSubmitters(DigitalContract contract, JsonNode root) {
        JsonNode submittersNode = root.isArray() ? root : root.path("submitters");
        if (!submittersNode.isArray() && root.has("data")) {
            submittersNode = root.path("data");
        }

        if (root.has("id") && root.path("id").canConvertToLong()) {
            contract.setDocusealSubmissionId(root.path("id").asLong());
        }

        for (JsonNode submitter : submittersNode) {
            long submitterId = submitter.path("id").asLong(0);
            long submissionId = firstLong(submitter, "submission_id", "submissionId");
            if (submissionId == 0 && submitter.path("submission").path("id").canConvertToLong()) {
                submissionId = submitter.path("submission").path("id").asLong();
            }
            if (submissionId != 0) {
                contract.setDocusealSubmissionId(submissionId);
            }

            String role = text(submitter, "role", "name");
            String embedUrl = text(submitter, "embed_src", "embedSrc", "embed_url", "embedUrl");
            if (matchesRole(role, docusealRenterRole)) {
                contract.setDocusealRenterSubmitterId(submitterId);
                contract.setDocusealRenterEmbedUrl(embedUrl);
            } else if (matchesRole(role, docusealOwnerRole)) {
                contract.setDocusealOwnerSubmitterId(submitterId);
                contract.setDocusealOwnerEmbedUrl(embedUrl);
            }
        }
    }

    private void refreshDocuSealStatus(DigitalContract contract) {
        if (!isDocuSealConfigured() || contract.getDocusealSubmissionId() == null) {
            return;
        }

        boolean changed = false;
        changed |= refreshSubmitter(contract, true, contract.getDocusealRenterSubmitterId());
        changed |= refreshSubmitter(contract, false, contract.getDocusealOwnerSubmitterId());
        if (changed) {
            contract.checkAndSetFullySigned();
            updateContractWorkflowStatus(contract);
        }
    }

    private void updateContractWorkflowStatus(DigitalContract contract) {
        contract.checkAndSetFullySigned();
        if (Boolean.TRUE.equals(contract.getIsFullySigned())) {
            contract.setDocusealStatus("completed");
        } else if (contract.getRenterSignedAt() != null) {
            contract.setDocusealStatus("awaiting_owner");
        } else {
            contract.setDocusealStatus("awaiting_renter");
        }
    }

    private void updateContractWorkflowStatus(DigitalContract contract, String fallbackStatus) {
        contract.checkAndSetFullySigned();
        if (Boolean.TRUE.equals(contract.getIsFullySigned())) {
            contract.setDocusealStatus("completed");
        } else if (contract.getRenterSignedAt() != null) {
            contract.setDocusealStatus("awaiting_owner");
        } else if (fallbackStatus != null && !fallbackStatus.isBlank()) {
            contract.setDocusealStatus(fallbackStatus);
        } else {
            contract.setDocusealStatus("awaiting_renter");
        }
    }

    private boolean refreshSubmitter(DigitalContract contract, boolean renter, Long submitterId) {
        if (submitterId == null || submitterId <= 0) {
            return false;
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(trimTrailingSlash(docusealBaseUrl) + "/submitters/" + submitterId))
                    .header("X-Auth-Token", docusealApiToken)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return false;
            }
            JsonNode submitter = objectMapper.readTree(response.body());
            String completedAt = text(submitter, "completed_at", "completedAt");
            String status = text(submitter, "status");
            boolean completed = completedAt != null || "completed".equalsIgnoreCase(status) || "signed".equalsIgnoreCase(status);
            if (!completed) {
                return false;
            }

            if (renter && contract.getRenterSignedAt() == null) {
                contract.setRenterSignature("DocuSeal verified signature");
                contract.setRenterSignedAt(LocalDateTime.now());
                return true;
            }
            if (!renter && contract.getOwnerSignedAt() == null) {
                contract.setOwnerSignature("DocuSeal verified signature");
                contract.setOwnerSignedAt(LocalDateTime.now());
                return true;
            }
        } catch (Exception ignored) {
            return false;
        }
        return false;
    }

    private String resolveFrontendUrl() {
        String frontendUrl = System.getenv("FRONTEND_URL");
        return frontendUrl != null && !frontendUrl.isBlank() ? frontendUrl : "http://localhost:5173";
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String money(BigDecimal value) {
        return value != null ? value.stripTrailingZeros().toPlainString() : "0";
    }

    private String safeText(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private boolean matchesRole(String actual, String expected) {
        return actual != null && expected != null && actual.trim().equalsIgnoreCase(expected.trim());
    }

    private long firstLong(JsonNode node, String... names) {
        for (String name : names) {
            if (node.has(name) && node.path(name).canConvertToLong()) {
                return node.path(name).asLong();
            }
        }
        return 0;
    }

    private String text(JsonNode node, String... names) {
        for (String name : names) {
            JsonNode value = node.path(name);
            if (!value.isMissingNode() && !value.isNull() && !value.asText().isBlank()) {
                return value.asText();
            }
        }
        return null;
    }

    private String safeDocuSealBody(String body) {
        if (body == null || body.isBlank()) {
            return "empty response";
        }
        return body.length() > 500 ? body.substring(0, 500) : body;
    }
}
