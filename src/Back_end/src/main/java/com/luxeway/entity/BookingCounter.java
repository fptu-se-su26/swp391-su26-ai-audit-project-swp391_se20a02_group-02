package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_counters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCounter {

    @Id
    @Column(length = 50)
    private String name;

    @Column(name = "counter_value", nullable = false)
    private Long value;
}
