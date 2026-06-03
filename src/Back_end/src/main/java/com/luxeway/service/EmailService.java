package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.Invoice;
import com.luxeway.entity.Dispute;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String email, String otp) {
        log.info("[OTP FOR DEV/STAGING]: Send to email [{}] - Code [{}]", email, otp);
        String subject = "LuxeWay - Forgot Password OTP Verification Code";
        String htmlContent = "<h2>LuxeWay Account Recovery</h2>"
                + "<p>You requested a password reset. Your OTP verification code is:</p>"
                + "<h1 style='color: #4F46E5; font-size: 32px; letter-spacing: 5px;'>" + otp + "</h1>"
                + "<p>This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendBookingConfirmation(String email, Booking booking) {
        log.info("[BOOKING DEV LOGGER]: Sending booking confirmation for #{} to {}", booking.getId(), email);
        String subject = "LuxeWay - Booking Confirmation #" + booking.getId().substring(0, 8).toUpperCase();
        String htmlContent = "<h2>Thank you for your LuxeWay booking!</h2>"
                + "<p>Your booking has been successfully confirmed. Below are the details:</p>"
                + "<ul>"
                + "<li><b>Vehicle:</b> " + booking.getVehicle().getBrand() + " " + booking.getVehicle().getModel() + "</li>"
                + "<li><b>Period:</b> " + booking.getStartDate() + " to " + booking.getEndDate() + "</li>"
                + "<li><b>Total Days:</b> " + booking.getTotalDays() + "</li>"
                + "<li><b>Total Paid:</b> " + String.format("%,.0f VND", booking.getTotal()) + "</li>"
                + "</ul>"
                + "<p>Manage your booking from your customer dashboard anytime.</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendInvoiceEmail(String email, Invoice invoice, byte[] pdfBytes) {
        log.info("[INVOICE DEV LOGGER]: Sending PDF invoice #{} to {}", invoice.getInvoiceNumber(), email);
        String subject = "LuxeWay - Invoice " + invoice.getInvoiceNumber();
        String htmlContent = "<h2>Your LuxeWay PDF Invoice is Ready</h2>"
                + "<p>Thank you for choosing LuxeWay! Attached is your official invoice <b>" + invoice.getInvoiceNumber() + "</b> for booking <b>#" + invoice.getBooking().getId().substring(0, 8).toUpperCase() + "</b>.</p>"
                + "<p>Total Amount: <b>" + String.format("%,.0f VND", invoice.getAmount()) + "</b></p>"
                + "<p>Please view the attached PDF for a full daily pricing breakdown.</p>";
        sendEmail(email, subject, htmlContent, "invoice-" + invoice.getInvoiceNumber() + ".pdf", pdfBytes);
    }

    public void sendDisputeUpdate(String email, Dispute dispute) {
        log.info("[DISPUTE DEV LOGGER]: Sending dispute update for #{} to {}", dispute.getId(), email);
        String subject = "LuxeWay - Dispute Moderation Update #" + dispute.getId();
        String htmlContent = "<h2>LuxeWay Dispute Resolution Center</h2>"
                + "<p>Your dispute ticket <b>#" + dispute.getId() + "</b> status has been updated.</p>"
                + "<p>New Status: <b style='color: #DC2626;'>" + dispute.getStatus() + "</b></p>"
                + "<p>Current Resolution Notes: " + (dispute.getAdminDecision() != null ? dispute.getAdminDecision() : "Under review by support agent.") + "</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendPasswordResetSuccess(String email) {
        log.info("[PASSWORD RESET SUCCESS LOGGER]: Sending confirmation to {}", email);
        String subject = "LuxeWay - Password Reset Successfully";
        String htmlContent = "<h2>Password Reset Success</h2>"
                + "<p>Your LuxeWay account password has been successfully reset.</p>"
                + "<p>If you did not initiate this request, please contact our support team immediately.</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendEmailVerification(String email, String firstName) {
        log.info("[EMAIL VERIFICATION LOGGER]: Sending welcome/verification to {}", email);
        String subject = "Welcome to LuxeWay - Email Verified Successfully";
        String htmlContent = "<h2>Welcome to LuxeWay, " + firstName + "!</h2>"
                + "<p>Thank you for registering. Your email address has been successfully verified, and your account is active.</p>"
                + "<p>Log in to search premium vehicles or list your fleet.</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendBookingCancellation(String email, Booking booking) {
        log.info("[BOOKING CANCELLATION LOGGER]: Sending cancellation for #{} to {}", booking.getId(), email);
        String subject = "LuxeWay - Booking Cancelled #" + booking.getId().substring(0, 8).toUpperCase();
        String htmlContent = "<h2>LuxeWay Booking Cancelled</h2>"
                + "<p>Your booking <b>#" + booking.getId().substring(0, 8).toUpperCase() + "</b> has been cancelled.</p>"
                + "<ul>"
                + "<li><b>Vehicle:</b> " + booking.getVehicle().getBrand() + " " + booking.getVehicle().getModel() + "</li>"
                + "<li><b>Dates:</b> " + booking.getStartDate() + " to " + booking.getEndDate() + "</li>"
                + "<li><b>Total Days:</b> " + booking.getTotalDays() + "</li>"
                + "<li><b>Refund Amount:</b> " + String.format("%,.0f VND", booking.getTotal()) + "</li>"
                + "</ul>"
                + "<p>If you have any questions, please contact our dispute resolution center.</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendKycStatus(String email, String docType, String status, String reason) {
        log.info("[KYC STATUS LOGGER]: Sending KYC update ({}) to {}", status, email);
        String subject = "LuxeWay - KYC Identity Verification Update";
        String htmlContent = "<h2>Identity Verification Update</h2>"
                + "<p>Your uploaded document (<b>" + docType.replace("_", " ") + "</b>) has been reviewed by our compliance team.</p>"
                + "<p>Status: <b style='color: " + ("VERIFIED".equals(status) ? "#16A34A" : "#DC2626") + ";'>" + status + "</b></p>"
                + ("REJECTED".equals(status) && reason != null ? "<p><b>Reason:</b> " + reason + "</p>" : "")
                + "<p>Please view your dashboard for details.</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendVehicleApprovalStatus(String email, com.luxeway.entity.Vehicle vehicle, String status, String reason) {
        log.info("[VEHICLE APPROVAL LOGGER]: Sending vehicle approval ({}) for {} to {}", status, vehicle.getLicensePlate(), email);
        String subject = "LuxeWay - Vehicle Listing Moderation Update";
        String htmlContent = "<h2>Vehicle Listing Moderation</h2>"
                + "<p>Your listing for <b>" + vehicle.getBrand() + " " + vehicle.getModel() + " (" + vehicle.getLicensePlate() + ")</b> has been reviewed.</p>"
                + "<p>Status: <b style='color: " + ("AVAILABLE".equals(status) ? "#16A34A" : "#DC2626") + ";'>" + ("AVAILABLE".equals(status) ? "APPROVED & LIVE" : "REJECTED") + "</b></p>"
                + ("REJECTED".equals(status) && reason != null ? "<p><b>Reason for rejection:</b> " + reason + "</p>" : "")
                + "<p>Thank you for partnering with LuxeWay.</p>";
        sendEmail(email, subject, htmlContent, null, null);
    }

    public void sendAdminNotification(String subject, String message) {
        log.info("[ADMIN ALERT LOGGER]: Sending notification to admin: {}", subject);
        String adminEmail = "admin@luxeway.com";
        String htmlContent = "<h2>LuxeWay Administrative Alert</h2>"
                + "<p>The following administrative event requires attention:</p>"
                + "<div style='background-color: #F8FAFC; padding: 12px; border-left: 4px solid #4F46E5; border-radius: 4px; font-family: monospace; white-space: pre-wrap;'>" + message + "</div>"
                + "<p>Please access the platform operations console to verify details.</p>";
        sendEmail(adminEmail, subject, htmlContent, null, null);
    }

    private void sendEmail(String to, String subject, String htmlContent, String attachmentName, byte[] attachmentBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("luxeway.vn@gmail.com");

            if (attachmentName != null && attachmentBytes != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(attachmentBytes));
            }

            mailSender.send(message);
            log.info("Email successfully sent to [{}] with subject [{}]", to, subject);
        } catch (Exception e) {
            log.warn("SMTP send failed (offline/dev/mock credentials). Falling back to dynamic log printing. Details: {}", e.getMessage());
            log.info("---- OFFLINE EMAIL DISPATCH MOCK ----\nTo: {}\nSubject: {}\nBody:\n{}\n-------------------------------------", to, subject, htmlContent);
        }
    }
}
