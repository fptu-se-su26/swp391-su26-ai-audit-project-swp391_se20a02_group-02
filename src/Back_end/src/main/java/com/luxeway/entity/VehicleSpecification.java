package com.luxeway.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vehicle_specifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleSpecification {

    @Id
    @Column(name = "vehicle_id", length = 36)
    private String vehicleId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private Integer horsepower;

    @Column(name = "top_speed_kmh")
    private Integer topSpeedKmh;

    @Column(name = "acceleration_sec", precision = 4, scale = 2)
    private BigDecimal accelerationSec;

    @NotNull
    private Integer seats;

    private Integer doors;

    @Column(nullable = false, length = 20)
    private String transmission; // MANUAL, AUTOMATIC

    @Column(name = "fuel_type", nullable = false, length = 20)
    private String fuelType; // GASOLINE, DIESEL, ELECTRIC, HYBRID

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "engine_size", length = 20)
    private String engineSize;

    @Column(length = 50)
    private String color;

    @Column(name = "license_plate", length = 20, unique = true, nullable = false)
    private String licensePlate;
}
