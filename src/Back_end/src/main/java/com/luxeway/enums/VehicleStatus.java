package com.luxeway.enums;

public enum VehicleStatus {
    AVAILABLE("Available"),
    UNAVAILABLE("Unavailable"),
    BOOKED("Booked"),
    RENTED("Currently Rented"),
    INACTIVE("Inactive"),
    MAINTENANCE("Under Maintenance");
    
    private final String displayName;
    
    VehicleStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}