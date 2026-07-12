package com.luxeway.enums;

public enum VehicleStatus {
    AVAILABLE("Available"),
    RENTED("Currently Rented"),
    MAINTENANCE("Under Maintenance"),
    DRAFT("Draft"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    BLOCKED("Blocked"),
    INACTIVE("Inactive");
    
    private final String displayName;
    
    VehicleStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}