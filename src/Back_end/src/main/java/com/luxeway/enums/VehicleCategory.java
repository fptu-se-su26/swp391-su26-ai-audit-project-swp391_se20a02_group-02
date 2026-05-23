package com.luxeway.enums;

public enum VehicleCategory {
    ECONOMY("Economy"),
    FAMILY("Family"),
    BUSINESS("Business"),
    ELECTRIC("Electric"),
    MOTORBIKE("Motorbike"),
    SUV("SUV"),
    CITY_CAR("City Car"),
    TOURISM("Tourism");
    
    private final String displayName;
    
    VehicleCategory(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}