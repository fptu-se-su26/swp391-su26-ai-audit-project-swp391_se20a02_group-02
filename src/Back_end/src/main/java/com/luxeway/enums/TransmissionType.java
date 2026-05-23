package com.luxeway.enums;

public enum TransmissionType {
    AUTOMATIC("Automatic"),
    MANUAL("Manual");
    
    private final String displayName;
    
    TransmissionType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}