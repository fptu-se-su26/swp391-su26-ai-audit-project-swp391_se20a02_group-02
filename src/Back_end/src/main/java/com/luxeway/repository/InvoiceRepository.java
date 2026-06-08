package com.luxeway.repository;

import com.luxeway.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    Optional<Invoice> findByBookingId(String bookingId);

    List<Invoice> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
