package com.luxeway.enums;

public enum BookingStatus {
    PENDING("Pending Approval"),
    CONFIRMED("Confirmed"),
    ACTIVE("Active Rental"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    DISPUTED("Disputed");
    
    private final String displayName;
    
    BookingStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}