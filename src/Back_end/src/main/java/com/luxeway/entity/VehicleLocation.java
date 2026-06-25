package com.luxeway.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vehicle_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleLocation {

    @Id
    @Column(name = "vehicle_id", length = 36)
    private String vehicleId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String city;

    @NotBlank
    @Column(nullable = false, length = 100)
    @Builder.Default
    private String country = "Vietnam";

    @NotBlank
    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String address;

    @NotNull
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @NotNull
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String timezone = "Asia/Ho_Chi_Minh";
}
