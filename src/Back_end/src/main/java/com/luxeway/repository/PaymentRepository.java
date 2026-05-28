package com.luxeway.repository;

import com.luxeway.entity.Payment;
import com.luxeway.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    List<Payment> findByBookingId(String bookingId);

    Page<Payment> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Optional<Payment> findByTransactionId(String transactionId);

    boolean existsByTransactionId(String transactionId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.user.id = :userId AND p.status = :status")
    BigDecimal sumAmountByUserIdAndStatus(@Param("userId") String userId, @Param("status") PaymentStatus status);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal sumTotalPaymentsByStatus(@Param("status") PaymentStatus status);

    default BigDecimal sumTotalCompletedPayments() {
        return sumTotalPaymentsByStatus(PaymentStatus.SUCCEEDED);
    }

    long countByStatus(PaymentStatus status);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
