package com.luxeway.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_delivery")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDelivery {

    @Id
    @Column(name = "booking_id", length = 36)
    private String bookingId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String address;

    @NotNull
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @NotNull
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @NotBlank
    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, IN_TRANSIT, DELIVERED, RETURNED

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;
}
