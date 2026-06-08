package com.luxeway.enums;

public enum VehicleType {
    CAR("Car"),
    MOTORBIKE("Motorbike");

    private final String displayName;

    VehicleType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
