package com.luxeway.enums;

public enum UserRole {
    CUSTOMER("Customer"),
    OWNER("Vehicle Owner"),
    ADMIN("Administrator"),
    SUPER_ADMIN("Super Administrator");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Returns true for any role that grants admin-level access.
     */
    public boolean hasAdminAccess() {
        return this == ADMIN || this == SUPER_ADMIN;
    }
}