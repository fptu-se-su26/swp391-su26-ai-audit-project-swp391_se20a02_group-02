package com.luxeway.enums;

public enum VehicleStatus {
    AVAILABLE("Available"),
    RENTED("Currently Rented"),
    MAINTENANCE("Under Maintenance"),
    PENDING_APPROVAL("Pending Approval"),
    REJECTED("Rejected"),
    INACTIVE("Inactive");
    
    private final String displayName;
    
    VehicleStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}