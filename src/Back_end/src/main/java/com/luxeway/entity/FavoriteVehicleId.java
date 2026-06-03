package com.luxeway.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteVehicleId implements Serializable {
    private String userId;
    private String vehicleId;
}
