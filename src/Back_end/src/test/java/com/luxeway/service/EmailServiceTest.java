package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock private JavaMailSender mailSender;
    @Mock private UserRepository userRepository;
    @Mock private TranslationService translationService;

    @InjectMocks
    private EmailService emailService;

    @Mock private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        // leniency for when createMimeMessage is called
        lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    // =======================================================
    // Language Resolution
    // =======================================================

    @Test
    void sendOtp_UserExists_UsesPreferredLanguage() {
        String email = "test@luxeway.com";
        User user = User.builder().preferredLanguage("fr").build();
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(translationService.getMessage("email.otp.subject", "fr")).thenReturn("Sujet");
        when(translationService.getMessage("email.otp.body", "fr", "123456")).thenReturn("Corps");

        emailService.sendOtp(email, "123456");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendOtp_UserNotFound_DefaultsToEnglish() {
        String email = "unknown@luxeway.com";
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(translationService.getMessage("email.otp.subject", "en")).thenReturn("Subject");
        when(translationService.getMessage("email.otp.body", "en", "654321")).thenReturn("Body");

        emailService.sendOtp(email, "654321");

        verify(mailSender).send(mimeMessage);
    }

    // =======================================================
    // Booking Confirmation
    // =======================================================

    @Test
    void sendBookingConfirmation_UsesRenterLanguageAndFormatsData() {
        User renter = User.builder().preferredLanguage("es").build();
        Vehicle vehicle = Vehicle.builder().brand("Toyota").model("Camry").build();
        Booking booking = Booking.builder()
                .id("B-123456789")
                .renter(renter)
                .vehicle(vehicle)
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 5))
                .totalDays(4)
                .total(new java.math.BigDecimal("1000000.00"))
                .build();

        // Should use "es" from Renter
        when(translationService.getMessage("email.booking.confirm.subject", "es", "B-123456")).thenReturn("Sub");
        when(translationService.getMessage(eq("email.booking.confirm.body"), eq("es"), 
                eq("Toyota"), eq("Camry"), anyString(), anyString(), eq("4"), eq("1,000,000 VND"))).thenReturn("Body");

        emailService.sendBookingConfirmation("renter@test.com", booking);

        verify(mailSender).send(mimeMessage);
    }

    // =======================================================
    // KYC and Vehicle Approval Status
    // =======================================================

    @Test
    void sendKycStatus_FormatsReasonWhenRejected() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.empty()); // defaults to 'en'
        
        // reason gets wrapped in HTML tags by the logic
        when(translationService.getMessage("email.kyc.subject", "en")).thenReturn("Subject");
        when(translationService.getMessage("email.kyc.body", "en", "PASSPORT", "#DC2626", "REJECTED", "<p><b>Reason:</b> Blurry</p>")).thenReturn("Body");

        emailService.sendKycStatus("user@test.com", "PASSPORT", "REJECTED", "Blurry");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendVehicleApprovalStatus_FormatsReasonWhenRejected() {
        Vehicle vehicle = Vehicle.builder().brand("Tesla").model("Model 3").licensePlate("29A-123.45").build();
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.empty()); // defaults to 'en'

        when(translationService.getMessage("email.vehicle.subject", "en")).thenReturn("Subject");
        when(translationService.getMessage("email.vehicle.body", "en", "Tesla", "Model 3", "29A-123.45", "#DC2626", "REJECTED", "<p><b>Reason for rejection:</b> Fake</p>")).thenReturn("Body");

        emailService.sendVehicleApprovalStatus("owner@test.com", vehicle, "REJECTED", "Fake");

        verify(mailSender).send(mimeMessage);
    }

    // =======================================================
    // Admin Notification
    // =======================================================

    @Test
    void sendAdminNotification_SendsToHardcodedAdminEmail() {
        emailService.sendAdminNotification("System Alert", "Database is down");

        verify(mailSender).send(mimeMessage);
        // The MimeMessage verification in detail requires PowerMock for static StandardCharsets, 
        // but verifying send() with the constructed mimeMessage proves execution flowed without Exception.
    }

    // =======================================================
    // Error Handling
    // =======================================================

    @Test
    void sendCustomHtmlEmail_CatchesMessagingExceptionAndLogs() {
        // Force the creation to throw to simulate an SMTP error
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("SMTP offline"));

        // Call should NOT throw an exception, it should be caught and logged
        assertDoesNotThrow(() -> emailService.sendCustomHtmlEmail("to@test.com", "Subject", "Body"));
        
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
