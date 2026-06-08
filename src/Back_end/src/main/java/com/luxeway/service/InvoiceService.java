package com.luxeway.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.luxeway.entity.Booking;
import com.luxeway.entity.Invoice;
import com.luxeway.entity.User;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final TranslationService translationService;

    @Transactional
    public Invoice generateInvoiceForBooking(String bookingId) {
        return generateInvoiceForBooking(bookingId, null, true);
    }

    @Transactional
    public Invoice generateInvoiceForBooking(String bookingId, String requesterId, boolean isAdmin) {
        Optional<Invoice> existing = invoiceRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            Invoice invoice = existing.get();
            Booking booking = invoice.getBooking();
            if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
                throw new org.springframework.security.access.AccessDeniedException("Not authorized to access invoice for this booking");
            }
            return invoice;
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to generate invoice for this booking");
        }

        BigDecimal taxAmount = booking.getTaxes() != null ? booking.getTaxes() : BigDecimal.ZERO;
        BigDecimal amount = booking.getTotal() != null ? booking.getTotal() : BigDecimal.ZERO;

        String invoiceNumber = "INV-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Invoice invoice = Invoice.builder()
                .booking(booking)
                .user(booking.getRenter())
                .invoiceNumber(invoiceNumber)
                .amount(amount)
                .taxAmount(taxAmount)
                .status("PAID") // Mark paid on generation since checkout completed successfully
                .issuedAt(LocalDateTime.now())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        try {
            byte[] pdfBytes = getInvoicePdfStream(savedInvoice.getId());
            emailService.sendInvoiceEmail(savedInvoice.getUser().getEmail(), savedInvoice, pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate and email PDF invoice: {}", e.getMessage());
        }
        return savedInvoice;
    }

    public List<Invoice> getUserInvoices(String userId) {
        return invoiceRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Invoice> getInvoiceById(String id) {
        return invoiceRepository.findById(id);
    }

    public Optional<Invoice> getInvoiceById(String id, String requesterId, boolean isAdmin) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(id);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            Booking booking = invoice.getBooking();
            if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
                throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this invoice");
            }
        }
        return invoiceOpt;
    }

    public byte[] getInvoicePdfStream(String invoiceId) throws Exception {
        return getInvoicePdfStream(invoiceId, null, true);
    }

    public byte[] getInvoicePdfStream(String invoiceId, String requesterId, boolean isAdmin) throws Exception {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        Booking booking = invoice.getBooking();
        if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to access this invoice");
        }

        User renter = invoice.getUser();
        User owner = booking.getOwner();
        String lang = renter.getPreferredLanguage();
        if (lang == null || lang.trim().isEmpty()) {
            lang = "en";
        }

        Document document = new Document(PageSize.A4, 36, 36, 54, 36);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);

        document.open();

        // Styles & Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new BaseColor(15, 23, 42)); // Slate 900
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new BaseColor(100, 116, 139)); // Slate 500
        Font boldLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(15, 23, 42));
        Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new BaseColor(51, 65, 85)); // Slate 700
        Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(79, 70, 229)); // Indigo 600

        // 1. HEADER SECTION
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1.5f, 1.0f});

        // Logo & Title
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        Paragraph brandName = new Paragraph("LuxeWay", titleFont);
        brandName.setSpacingAfter(4);
        leftCell.addElement(brandName);
        leftCell.addElement(new Paragraph(translationService.getMessage("invoice.subtitle", lang), subtitleFont));
        headerTable.addCell(leftCell);

        // Invoice Number & Date
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph invNumberParagraph = new Paragraph(translationService.getMessage("invoice.number", lang, invoice.getInvoiceNumber()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new BaseColor(79, 70, 229)));
        invNumberParagraph.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(invNumberParagraph);
        
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String formattedDate = (invoice.getIssuedAt() != null ? invoice.getIssuedAt().format(dtf) : invoice.getCreatedAt().format(dtf));
        Paragraph dateParagraph = new Paragraph(translationService.getMessage("invoice.issuedDate", lang, formattedDate), subtitleFont);
        dateParagraph.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(dateParagraph);
        headerTable.addCell(rightCell);

        headerTable.setSpacingAfter(10f);
        document.add(headerTable);

        // Divider
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        PdfPCell divCell = new PdfPCell(new Paragraph(" "));
        divCell.setBorder(Rectangle.BOTTOM);
        divCell.setBorderWidth(1f);
        divCell.setBorderColor(new BaseColor(226, 232, 240)); // Slate 200
        divCell.setFixedHeight(2f);
        divider.addCell(divCell);
        divider.setSpacingAfter(15f);
        document.add(divider);

        // 2. CLIENTS & DETAILS
        PdfPTable clientTable = new PdfPTable(2);
        clientTable.setWidthPercentage(100);
        clientTable.setWidths(new float[]{1.0f, 1.0f});

        // Bill To (Renter)
        PdfPCell renterCell = new PdfPCell();
        renterCell.setBorder(Rectangle.NO_BORDER);
        renterCell.addElement(new Paragraph(translationService.getMessage("invoice.billTo", lang), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(100, 116, 139))));
        renterCell.addElement(new Paragraph(renter.getFullName(), boldLabelFont));
        renterCell.addElement(new Paragraph("Email: " + renter.getEmail(), regularFont));
        renterCell.addElement(new Paragraph("Phone: " + (renter.getPhone() != null ? renter.getPhone() : "N/A"), regularFont));
        clientTable.addCell(renterCell);

        // Bill From (Owner/LuxeWay)
        PdfPCell ownerCell = new PdfPCell();
        ownerCell.setBorder(Rectangle.NO_BORDER);
        ownerCell.addElement(new Paragraph(translationService.getMessage("invoice.vehicleProvider", lang), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(100, 116, 139))));
        ownerCell.addElement(new Paragraph(owner != null ? owner.getFullName() : "LuxeWay Partner", boldLabelFont));
        ownerCell.addElement(new Paragraph("Email: " + (owner != null ? owner.getEmail() : "support@luxeway.com"), regularFont));
        ownerCell.addElement(new Paragraph("Phone: " + (owner != null && owner.getPhone() != null ? owner.getPhone() : "N/A"), regularFont));
        clientTable.addCell(ownerCell);

        clientTable.setSpacingAfter(20f);
        document.add(clientTable);

        // 3. VEHICLE & RENTAL DURATION INFORMATION
        PdfPTable infoTable = new PdfPTable(3);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1.5f, 1.5f, 1.0f});

        // Header cells
        PdfPCell header1 = new PdfPCell(new Paragraph(translationService.getMessage("invoice.vehicleDetails", lang), boldLabelFont));
        header1.setBackgroundColor(new BaseColor(248, 250, 252));
        header1.setPadding(8);
        header1.setBorderColor(new BaseColor(226, 232, 240));
        infoTable.addCell(header1);

        PdfPCell header2 = new PdfPCell(new Paragraph(translationService.getMessage("invoice.rentalPeriod", lang), boldLabelFont));
        header2.setBackgroundColor(new BaseColor(248, 250, 252));
        header2.setPadding(8);
        header2.setBorderColor(new BaseColor(226, 232, 240));
        infoTable.addCell(header2);

        PdfPCell header3 = new PdfPCell(new Paragraph(translationService.getMessage("invoice.totalDuration", lang), boldLabelFont));
        header3.setBackgroundColor(new BaseColor(248, 250, 252));
        header3.setPadding(8);
        header3.setBorderColor(new BaseColor(226, 232, 240));
        infoTable.addCell(header3);

        // Content cells
        PdfPCell cell1 = new PdfPCell(new Paragraph(booking.getVehicle().getBrand() + " " + booking.getVehicle().getModel() + "\nLicense Plate: " + (booking.getVehicle().getLicensePlate() != null ? booking.getVehicle().getLicensePlate() : "N/A"), regularFont));
        cell1.setPadding(8);
        cell1.setBorderColor(new BaseColor(226, 232, 240));
        infoTable.addCell(cell1);

        PdfPCell cell2 = new PdfPCell(new Paragraph(booking.getStartDate() + " to " + booking.getEndDate(), regularFont));
        cell2.setPadding(8);
        cell2.setBorderColor(new BaseColor(226, 232, 240));
        infoTable.addCell(cell2);

        PdfPCell cell3 = new PdfPCell(new Paragraph(translationService.getMessage("invoice.days", lang, booking.getTotalDays()), regularFont));
        cell3.setPadding(8);
        cell3.setBorderColor(new BaseColor(226, 232, 240));
        infoTable.addCell(cell3);

        infoTable.setSpacingAfter(20f);
        document.add(infoTable);

        // 4. ITEMIZATION BREAKDOWN
        PdfPTable pricingTable = new PdfPTable(2);
        pricingTable.setWidthPercentage(100);
        pricingTable.setWidths(new float[]{3.0f, 1.0f});

        // Headers
        PdfPCell pHeaderLeft = new PdfPCell(new Paragraph(translationService.getMessage("invoice.description", lang), boldLabelFont));
        pHeaderLeft.setBackgroundColor(new BaseColor(248, 250, 252));
        pHeaderLeft.setPadding(8);
        pHeaderLeft.setBorderColor(new BaseColor(226, 232, 240));
        pricingTable.addCell(pHeaderLeft);

        PdfPCell pHeaderRight = new PdfPCell(new Paragraph(translationService.getMessage("invoice.amount", lang), boldLabelFont));
        pHeaderRight.setBackgroundColor(new BaseColor(248, 250, 252));
        pHeaderRight.setPadding(8);
        pHeaderRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
        pHeaderRight.setBorderColor(new BaseColor(226, 232, 240));
        pricingTable.addCell(pHeaderRight);

        // Daily Price Line
        String rateLabel = translationService.getMessage("invoice.rate", lang, formatPrice(booking.getPricePerDay(), lang), booking.getTotalDays());
        pricingTable.addCell(createBorderedCell(rateLabel, regularFont, Rectangle.BOX));
        pricingTable.addCell(createBorderedCell(formatPrice(booking.getBasePrice(), lang), regularFont, Rectangle.BOX, Element.ALIGN_RIGHT));

        // Delivery Fee (If present)
        if (booking.getDeliveryFee() != null && booking.getDeliveryFee().compareTo(BigDecimal.ZERO) > 0) {
            pricingTable.addCell(createBorderedCell(translationService.getMessage("invoice.deliveryFee", lang), regularFont, Rectangle.BOX));
            pricingTable.addCell(createBorderedCell(formatPrice(booking.getDeliveryFee(), lang), regularFont, Rectangle.BOX, Element.ALIGN_RIGHT));
        }

        // Addons (If present)
        if (booking.getAddonsTotal() != null && booking.getAddonsTotal().compareTo(BigDecimal.ZERO) > 0) {
            pricingTable.addCell(createBorderedCell(translationService.getMessage("invoice.addonsTotal", lang), regularFont, Rectangle.BOX));
            pricingTable.addCell(createBorderedCell(formatPrice(booking.getAddonsTotal(), lang), regularFont, Rectangle.BOX, Element.ALIGN_RIGHT));
        }

        // Insurance Fee (If present)
        if (booking.getInsuranceFee() != null && booking.getInsuranceFee().compareTo(BigDecimal.ZERO) > 0) {
            pricingTable.addCell(createBorderedCell(translationService.getMessage("invoice.insurance", lang), regularFont, Rectangle.BOX));
            pricingTable.addCell(createBorderedCell(formatPrice(booking.getInsuranceFee(), lang), regularFont, Rectangle.BOX, Element.ALIGN_RIGHT));
        }

        // Service Fee
        pricingTable.addCell(createBorderedCell(translationService.getMessage("invoice.serviceFee", lang), regularFont, Rectangle.BOX));
        pricingTable.addCell(createBorderedCell(formatPrice(booking.getServiceFee(), lang), regularFont, Rectangle.BOX, Element.ALIGN_RIGHT));

        // Taxes
        pricingTable.addCell(createBorderedCell(translationService.getMessage("invoice.taxes", lang), regularFont, Rectangle.BOX));
        pricingTable.addCell(createBorderedCell(formatPrice(booking.getTaxes(), lang), regularFont, Rectangle.BOX, Element.ALIGN_RIGHT));

        // Discount (If present)
        if (booking.getDiscount() != null && booking.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            pricingTable.addCell(createBorderedCell(translationService.getMessage("invoice.discount", lang), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(22, 163, 74)), Rectangle.BOX)); // Green 600
            pricingTable.addCell(createBorderedCell("-" + formatPrice(booking.getDiscount(), lang), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(22, 163, 74)), Rectangle.BOX, Element.ALIGN_RIGHT));
        }

        // Total
        PdfPCell totalLabelCell = new PdfPCell(new Paragraph(translationService.getMessage("invoice.total", lang), boldLabelFont));
        totalLabelCell.setBackgroundColor(new BaseColor(241, 245, 249)); // Slate 100
        totalLabelCell.setPadding(10);
        totalLabelCell.setBorderColor(new BaseColor(226, 232, 240));
        pricingTable.addCell(totalLabelCell);

        PdfPCell totalValCell = new PdfPCell(new Paragraph(formatPrice(booking.getTotal(), lang), totalFont));
        totalValCell.setBackgroundColor(new BaseColor(241, 245, 249));
        totalValCell.setPadding(10);
        totalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalValCell.setBorderColor(new BaseColor(226, 232, 240));
        pricingTable.addCell(totalValCell);

        pricingTable.setSpacingAfter(25f);
        document.add(pricingTable);

        // 5. INSTRUCTIONS / THANK YOU NOTE
        Paragraph paymentInfo = new Paragraph(translationService.getMessage("invoice.paymentStatus", lang, invoice.getStatus()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new BaseColor(22, 163, 74)));
        paymentInfo.setAlignment(Element.ALIGN_CENTER);
        paymentInfo.setSpacingAfter(10f);
        document.add(paymentInfo);
        
        Paragraph thankYou = new Paragraph(translationService.getMessage("invoice.thankYou", lang), subtitleFont);
        thankYou.setAlignment(Element.ALIGN_CENTER);
        document.add(thankYou);

        document.close();
        return baos.toByteArray();
    }

    private PdfPCell createBorderedCell(String text, Font font, int border) {
        return createBorderedCell(text, font, border, Element.ALIGN_LEFT);
    }

    private PdfPCell createBorderedCell(String text, Font font, int border, int alignment) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBorder(border);
        cell.setBorderColor(new BaseColor(241, 245, 249)); // light border
        cell.setPadding(8);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }

    private String formatPrice(BigDecimal val, String langCode) {
        if (val == null) val = BigDecimal.ZERO;
        if (langCode == null) langCode = "en";
        double vndAmount = val.doubleValue();
        switch (langCode.toLowerCase()) {
            case "vi":
                return String.format("%,.0f ₫", vndAmount).replace(',', '.');
            case "en":
                return String.format("$%,.2f", vndAmount / 25400.0);
            case "ja":
                return String.format("¥%,.0f", vndAmount / 162.0);
            case "ko":
                return String.format("₩%,.0f", vndAmount / 18.5);
            case "zh":
                return String.format("¥%,.2f", vndAmount / 3500.0);
            case "fr":
            case "de":
            case "es":
                return String.format("%,.2f €", vndAmount / 27500.0).replace(',', ' ').replace('.', ',');
            default:
                return String.format("$%,.2f", vndAmount / 25400.0);
        }
    }
}
