package com.luxeway.enums;

public enum PaymentStatus {
    PENDING("Pending"),
    PROCESSING("Processing"),
    SUCCEEDED("Succeeded"),
    FAILED("Failed"),
    REFUNDED("Refunded"),
    PAYMENT_PENDING("Payment Pending"),
    PAID("Paid");
    
    private final String displayName;
    
    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}