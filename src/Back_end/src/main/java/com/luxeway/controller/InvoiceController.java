package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.Invoice;
import com.luxeway.entity.User;
import com.luxeway.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Invoices", description = "Invoicing management and PDF downloads")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/generate/{bookingId}")
    @Operation(summary = "Generate an invoice for a specific completed booking")
    public ResponseEntity<ApiResponse<Invoice>> generateInvoice(
            @PathVariable String bookingId,
            @AuthenticationPrincipal User user) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            Invoice invoice = invoiceService.generateInvoiceForBooking(bookingId, user.getId(), isAdmin);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Invoice generated successfully", invoice));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error generating invoice: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
          }
    }

    @GetMapping("/user")
    @Operation(summary = "Get list of invoices associated with the current user")
    public ResponseEntity<ApiResponse<List<Invoice>>> getUserInvoices(
            @AuthenticationPrincipal User user) {
        List<Invoice> invoices = invoiceService.getUserInvoices(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Invoices retrieved successfully", invoices));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice details by ID")
    public ResponseEntity<ApiResponse<Invoice>> getInvoiceDetails(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return invoiceService.getInvoiceById(id, user.getId(), isAdmin)
                .map(invoice -> ResponseEntity.ok(ApiResponse.success("Invoice details retrieved", invoice)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Invoice not found with ID: " + id)));
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Download invoice PDF binary stream")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            byte[] pdfBytes = invoiceService.getInvoicePdfStream(id, user.getId(), isAdmin);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename("invoice-" + id + ".pdf")
                    .build());
            headers.setContentLength(pdfBytes.length);
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to generate and download PDF invoice: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
