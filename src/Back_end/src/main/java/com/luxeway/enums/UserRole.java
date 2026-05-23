package com.luxeway.enums;

public enum UserRole {
    CUSTOMER("Customer"),
    OWNER("Vehicle Owner"),
    ADMIN("Administrator");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}