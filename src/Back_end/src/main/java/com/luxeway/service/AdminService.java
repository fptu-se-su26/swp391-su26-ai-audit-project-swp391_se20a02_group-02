package com.luxeway.service;

import com.luxeway.dto.admin.AdminDTOs;
import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.dto.user.UserDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.Dispute;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.UserRole;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class AdminService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final VehicleService vehicleService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final DisputeRepository disputeRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final AnalyticsRepository analyticsRepository;
    private final EmailService emailService;

    // ====== Dashboard Statistics ======

    public AdminDTOs.DashboardStatsResponse getDashboardStats() {
        AdminDTOs.DashboardStatsResponse stats = new AdminDTOs.DashboardStatsResponse();

        // Users
        stats.setTotalUsers(userRepository.count());
        stats.setTotalCustomers(userRepository.countByRoleAndIsActiveTrue(UserRole.CUSTOMER));
        stats.setTotalOwners(userRepository.countByRoleAndIsActiveTrue(UserRole.OWNER));
        stats.setTotalAdmins(userRepository.countByRoleAndIsActiveTrue(UserRole.ADMIN));
        stats.setVerifiedUsers(userRepository.countVerifiedUsers());

        // Vehicles
        stats.setTotalVehicles(vehicleRepository.count());
        stats.setAvailableVehicles(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));
        stats.setPendingApprovalVehicles(vehicleRepository.countByStatus(VehicleStatus.PENDING_APPROVAL));

        // Bookings
        stats.setTotalBookings(bookingRepository.count());
        stats.setPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.setActiveBookings(bookingRepository.countByStatus(BookingStatus.ACTIVE));
        stats.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));
        stats.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED));

        // Revenue
        BigDecimal revenue = bookingRepository.sumTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        return stats;
    }

    // ====== User Management ======

    public Page<UserDTOs.UserProfileResponse> listUsers(String role, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("joinedAt").descending());

        if (keyword != null && !keyword.isBlank()) {
            return userRepository.searchUsers(keyword, pageable).map(userService::toProfileResponse);
        }

        if (role != null && !role.isBlank()) {
            try {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                return userRepository.findByRole(userRole, pageable).map(userService::toProfileResponse);
            } catch (IllegalArgumentException ignored) {}
        }

        return userRepository.findAll(pageable).map(userService::toProfileResponse);
    }

    @Transactional
    public UserDTOs.UserProfileResponse updateUserStatus(String userId, AdminDTOs.UpdateUserStatusRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(req.isActive());
        user.setVerified(req.isVerified());
        user.setKycVerified(req.isKycVerified());

        user = userRepository.save(user);
        log.info("Admin updated user {} status: active={}, verified={}, kyc={}", userId, req.isActive(), req.isVerified(), req.isKycVerified());
        return userService.toProfileResponse(user);
    }

    // ====== Vehicle Management ======

    public Page<VehicleDTOs.VehicleResponse> listPendingVehicles(int page, int size) {
        // Do NOT add Sort here - 'OrderByCreatedAtDesc' in method name already handles ordering
        Pageable pageable = PageRequest.of(page, size);
        return vehicleRepository.findByStatusOrderByCreatedAtDesc(VehicleStatus.PENDING_APPROVAL, pageable)
                .map(vehicleService::toResponse);
    }

    public Page<VehicleDTOs.VehicleResponse> listAllVehicles(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (status != null && !status.isBlank()) {
            try {
                VehicleStatus vehicleStatus = VehicleStatus.valueOf(status.toUpperCase());
                return vehicleRepository.findByStatus(vehicleStatus, pageable).map(vehicleService::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }

        return vehicleRepository.findAll(pageable).map(vehicleService::toResponse);
    }

    @Transactional
    public VehicleDTOs.VehicleResponse approveVehicle(String vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setIsVerified(true);
        vehicle = vehicleRepository.save(vehicle);

        log.info("Vehicle {} approved by admin", vehicleId);
        try {
            emailService.sendVehicleApprovalStatus(vehicle.getOwner().getEmail(), vehicle, "AVAILABLE", null);
        } catch (Exception e) {
            log.warn("Failed to send vehicle approval email alert: {}", e.getMessage());
        }
        return vehicleService.toResponse(vehicle);
    }

    @Transactional
    public VehicleDTOs.VehicleResponse rejectVehicle(String vehicleId, String reason) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setStatus(VehicleStatus.REJECTED);
        vehicle = vehicleRepository.save(vehicle);

        log.info("Vehicle {} rejected: {}", vehicleId, reason);
        try {
            emailService.sendVehicleApprovalStatus(vehicle.getOwner().getEmail(), vehicle, "REJECTED", reason);
        } catch (Exception e) {
            log.warn("Failed to send vehicle rejection email alert: {}", e.getMessage());
        }
        return vehicleService.toResponse(vehicle);
    }

    // ====== Booking Management ======

    public Page<BookingDTOs.BookingResponse> listAllBookings(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (status != null && !status.isBlank()) {
            try {
                BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                return bookingRepository.findByStatus(bookingStatus, pageable)
                        .map(bookingService::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }

        return bookingRepository.findAll(pageable).map(bookingService::toResponse);
    }

    // ====== Payment Management ======

    public Page<PaymentDTOs.PaymentResponse> listAllPayments(int page, int size) {
        // Do NOT add Sort here - 'ByOrderByCreatedAtDesc' in method name already handles ordering
        Pageable pageable = PageRequest.of(page, size);
        return paymentRepository.findAllByOrderByCreatedAtDesc(pageable).map(paymentService::toResponse);
    }

    @Transactional
    public PaymentDTOs.PaymentResponse processRefund(String paymentId, AdminDTOs.RefundPaymentRequest req, String adminId) {
        return paymentService.refundPayment(paymentId, req.getRefundAmount(), adminId);
    }

    // ====== Dispute Management ======

    public java.util.List<Dispute> listAllDisputes() {
        return disputeRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional
    public UserDTOs.DocumentResponse reviewDocument(String documentId, AdminDTOs.ReviewDocumentRequest req) {
        com.luxeway.entity.UserDocument doc = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String status = req.getStatus().toUpperCase();
        if (!status.equals("VERIFIED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException("Invalid status. Must be VERIFIED or REJECTED");
        }

        doc.setStatus(status);
        doc.setVerifiedAt(java.time.LocalDateTime.now());
        if (status.equals("REJECTED")) {
            doc.setRejectionReason(req.getRejectionReason());
        } else {
            doc.setRejectionReason(null);
        }

        doc = userDocumentRepository.save(doc);

        // Synchronize user verification flags
        User user = doc.getUser();
        String docType = doc.getDocumentType().toUpperCase();
        if (status.equals("VERIFIED")) {
            if (docType.equals("DRIVING_LICENSE")) {
                user.setDrivingLicenseVerified(true);
            } else if (docType.equals("PASSPORT") || docType.equals("NATIONAL_ID")) {
                user.setKycVerified(true);
            }
        } else {
            // REJECTED
            if (docType.equals("DRIVING_LICENSE")) {
                user.setDrivingLicenseVerified(false);
            } else if (docType.equals("PASSPORT") || docType.equals("NATIONAL_ID")) {
                user.setKycVerified(false);
            }
        }

        // Synchronize overall user.verified status (requires both driving license and kyc/passport/national id)
        if (Boolean.TRUE.equals(user.getKycVerified()) && Boolean.TRUE.equals(user.getDrivingLicenseVerified())) {
            user.setVerified(true);
        } else {
            user.setVerified(false);
        }

        userRepository.save(user);
        log.info("Document {} reviewed by admin. Status={}, User verified={}", documentId, status, user.getVerified());

        try {
            emailService.sendKycStatus(user.getEmail(), docType, status, doc.getRejectionReason());
        } catch (Exception e) {
            log.warn("Failed to send KYC verification update email alert: {}", e.getMessage());
        }

        return userService.toDocumentResponse(doc);
    }

    // ====== Report Exporters ======

    public byte[] exportRevenueReportPdf() throws Exception {
        java.util.List<com.luxeway.entity.Booking> completedBookings = bookingRepository.findAll()
                .stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .toList();

        BigDecimal grossRevenue = completedBookings.stream()
                .map(com.luxeway.entity.Booking::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalServiceFee = completedBookings.stream()
                .map(com.luxeway.entity.Booking::getServiceFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTax = completedBookings.stream()
                .map(com.luxeway.entity.Booking::getTaxes)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        com.itextpdf.text.Document document = new com.itextpdf.text.Document(com.itextpdf.text.PageSize.A4, 36, 36, 54, 36);
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        com.itextpdf.text.pdf.PdfWriter.getInstance(document, baos);

        document.open();

        // Fonts
        com.itextpdf.text.Font titleFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 20, new com.itextpdf.text.BaseColor(15, 23, 42)); // Slate 900
        com.itextpdf.text.Font sectionFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 14, new com.itextpdf.text.BaseColor(79, 70, 229)); // Indigo 600
        com.itextpdf.text.Font boldFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 10, new com.itextpdf.text.BaseColor(15, 23, 42));
        com.itextpdf.text.Font regularFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA, 9, new com.itextpdf.text.BaseColor(51, 65, 85)); // Slate 700
        com.itextpdf.text.Font subtitleFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA, 10, new com.itextpdf.text.BaseColor(100, 116, 139)); // Slate 500

        // Header Title
        com.itextpdf.text.Paragraph mainTitle = new com.itextpdf.text.Paragraph("LuxeWay Premium Vehicle Rental Platform", titleFont);
        mainTitle.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
        mainTitle.setSpacingAfter(4f);
        document.add(mainTitle);

        com.itextpdf.text.Paragraph reportSubtitle = new com.itextpdf.text.Paragraph("OFFICIAL PLATFORM REVENUE & SALES AUDIT REPORT", subtitleFont);
        reportSubtitle.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
        reportSubtitle.setSpacingAfter(15f);
        document.add(reportSubtitle);

        // Divider
        com.itextpdf.text.pdf.PdfPTable divider = new com.itextpdf.text.pdf.PdfPTable(1);
        divider.setWidthPercentage(100);
        com.itextpdf.text.pdf.PdfPCell divCell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Paragraph(" "));
        divCell.setBorder(com.itextpdf.text.Rectangle.BOTTOM);
        divCell.setBorderWidth(1.5f);
        divCell.setBorderColor(new com.itextpdf.text.BaseColor(226, 232, 240));
        divCell.setFixedHeight(2f);
        divider.addCell(divCell);
        divider.setSpacingAfter(15f);
        document.add(divider);

        // Summary Card Table
        com.itextpdf.text.Paragraph sectTitle1 = new com.itextpdf.text.Paragraph("I. EXECUTIVE SUMMARY METRICS", sectionFont);
        sectTitle1.setSpacingAfter(8f);
        document.add(sectTitle1);

        com.itextpdf.text.pdf.PdfPTable summaryTable = new com.itextpdf.text.pdf.PdfPTable(4);
        summaryTable.setWidthPercentage(100);
        try {
            summaryTable.setWidths(new float[]{1f, 1f, 1f, 1f});
        } catch (Exception ignored) {}

        addSummaryCell(summaryTable, "Total Sales Revenue", formatPrice(grossRevenue), boldFont, regularFont);
        addSummaryCell(summaryTable, "Platform Service Fee", formatPrice(totalServiceFee), boldFont, regularFont);
        addSummaryCell(summaryTable, "Taxes Collected", formatPrice(totalTax), boldFont, regularFont);
        addSummaryCell(summaryTable, "Completed Bookings", completedBookings.size() + " Bookings", boldFont, regularFont);

        summaryTable.setSpacingAfter(20f);
        document.add(summaryTable);

        // Detailed Listing Table
        com.itextpdf.text.Paragraph sectTitle2 = new com.itextpdf.text.Paragraph("II. AUDITED HISTORICAL TRANSACTION BREAKDOWN", sectionFont);
        sectTitle2.setSpacingAfter(8f);
        document.add(sectTitle2);

        com.itextpdf.text.pdf.PdfPTable detailsTable = new com.itextpdf.text.pdf.PdfPTable(7);
        detailsTable.setWidthPercentage(100);
        try {
            detailsTable.setWidths(new float[]{1.5f, 1.5f, 1.8f, 1f, 1.2f, 1.2f, 1.5f});
        } catch (Exception ignored) {}

        // Headers
        addHeaderCell(detailsTable, "Booking ID", boldFont);
        addHeaderCell(detailsTable, "Renter Name", boldFont);
        addHeaderCell(detailsTable, "Vehicle Model", boldFont);
        addHeaderCell(detailsTable, "Days", boldFont);
        addHeaderCell(detailsTable, "Service Fee", boldFont);
        addHeaderCell(detailsTable, "Tax Summary", boldFont);
        addHeaderCell(detailsTable, "Gross Total", boldFont);

        for (com.luxeway.entity.Booking b : completedBookings) {
            detailsTable.addCell(createCell(b.getId().substring(0, 8).toUpperCase(), regularFont));
            detailsTable.addCell(createCell(b.getRenter() != null ? b.getRenter().getFullName() : "N/A", regularFont));
            detailsTable.addCell(createCell(b.getVehicle() != null ? b.getVehicle().getBrand() + " " + b.getVehicle().getModel() : "N/A", regularFont));
            detailsTable.addCell(createCell(String.valueOf(b.getTotalDays()), regularFont));
            detailsTable.addCell(createCell(formatPrice(b.getServiceFee()), regularFont, com.itextpdf.text.Element.ALIGN_RIGHT));
            detailsTable.addCell(createCell(formatPrice(b.getTaxes()), regularFont, com.itextpdf.text.Element.ALIGN_RIGHT));
            detailsTable.addCell(createCell(formatPrice(b.getTotal()), regularFont, com.itextpdf.text.Element.ALIGN_RIGHT));
        }

        detailsTable.setSpacingAfter(20f);
        document.add(detailsTable);

        // Footer
        com.itextpdf.text.Paragraph generationTime = new com.itextpdf.text.Paragraph("Generated Date: " + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), subtitleFont);
        generationTime.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
        generationTime.setSpacingBefore(10f);
        document.add(generationTime);

        com.itextpdf.text.Paragraph footerNote = new com.itextpdf.text.Paragraph("Confidential report generated for LuxeWay administration. Internal use only.", subtitleFont);
        footerNote.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
        document.add(footerNote);

        document.close();
        return baos.toByteArray();
    }

    public byte[] exportRevenueReportExcel() throws Exception {
        java.util.List<com.luxeway.entity.Analytics> analyticsList = analyticsRepository.findAll();
        analyticsList.sort((a1, a2) -> a1.getRecordDate().compareTo(a2.getRecordDate()));

        StringBuilder csv = new StringBuilder();
        // CSV Headers
        csv.append("Record Date,Total Revenue (VND),Bookings Count,Active Rentals,New Users Registered,New Vehicles Approved\n");

        for (com.luxeway.entity.Analytics a : analyticsList) {
            csv.append(a.getRecordDate()).append(",")
               .append(a.getRevenue() != null ? a.getRevenue().toPlainString() : "0.00").append(",")
               .append(a.getBookingsCount()).append(",")
               .append(a.getActiveRentals()).append(",")
               .append(a.getNewUsers()).append(",")
               .append(a.getNewVehicles()).append("\n");
        }

        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private void addSummaryCell(com.itextpdf.text.pdf.PdfPTable table, String label, String val, com.itextpdf.text.Font bold, com.itextpdf.text.Font regular) {
        com.itextpdf.text.pdf.PdfPCell cell = new com.itextpdf.text.pdf.PdfPCell();
        cell.setBackgroundColor(new com.itextpdf.text.BaseColor(248, 250, 252));
        cell.setBorderColor(new com.itextpdf.text.BaseColor(226, 232, 240));
        cell.setPadding(8);
        cell.addElement(new com.itextpdf.text.Paragraph(label, regular));
        com.itextpdf.text.Paragraph valParagraph = new com.itextpdf.text.Paragraph(val, bold);
        valParagraph.setSpacingBefore(4);
        cell.addElement(valParagraph);
        table.addCell(cell);
    }

    private void addHeaderCell(com.itextpdf.text.pdf.PdfPTable table, String text, com.itextpdf.text.Font font) {
        com.itextpdf.text.pdf.PdfPCell cell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Paragraph(text, font));
        cell.setBackgroundColor(new com.itextpdf.text.BaseColor(241, 245, 249));
        cell.setBorderColor(new com.itextpdf.text.BaseColor(226, 232, 240));
        cell.setPadding(6);
        cell.setHorizontalAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private com.itextpdf.text.pdf.PdfPCell createCell(String text, com.itextpdf.text.Font font) {
        return createCell(text, font, com.itextpdf.text.Element.ALIGN_LEFT);
    }

    private com.itextpdf.text.pdf.PdfPCell createCell(String text, com.itextpdf.text.Font font, int alignment) {
        com.itextpdf.text.pdf.PdfPCell cell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Paragraph(text, font));
        cell.setBorderColor(new com.itextpdf.text.BaseColor(241, 245, 249));
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }

    private String formatPrice(BigDecimal val) {
        if (val == null) return "0 VND";
        return String.format("%,.0f VND", val);
    }
}
