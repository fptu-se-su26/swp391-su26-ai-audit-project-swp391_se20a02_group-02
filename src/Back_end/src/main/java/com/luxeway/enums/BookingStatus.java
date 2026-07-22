package com.luxeway.enums;

public enum BookingStatus {
    // Legacy enums retained for system backward compatibility
    PENDING("Pending Approval"),
    CONFIRMED("Confirmed"),
    PICKING_UP("Picking Up"),
    IN_PROGRESS("In Progress"),
    ACTIVE("Active Rental"),
    DISPUTED("Disputed"),
    CANCELLED("Cancelled"),

    // Enterprise Booking & Payment Flow enums
    DRAFT("Draft"),
    WAITING_PAYMENT("Waiting Payment"),
    PAYMENT_PENDING("Payment Pending"),
    PAYMENT_VERIFIED("Payment Verified"),
    OWNER_APPROVED("Owner Approved"),
    READY_FOR_PICKUP("Ready for Pickup"),
    CHECKED_OUT("Checked Out"),
    IN_RENTAL("In Rental"),
    RETURN_PENDING("Return Pending"),
    RETURN_COMPLETED("Return Completed"),
    COMPLETED("Completed"),
    PAYMENT_EXPIRED("Payment Expired"),
    PAYMENT_REJECTED("Payment Rejected"),
    CANCELLATION_REQUESTED("Cancellation Requested"),
    CUSTOMER_CANCELLED("Customer Cancelled"),
    OWNER_CANCELLED("Owner Cancelled"),
    SYSTEM_CANCELLED("System Cancelled");
    
    private final String displayName;
    
    BookingStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
