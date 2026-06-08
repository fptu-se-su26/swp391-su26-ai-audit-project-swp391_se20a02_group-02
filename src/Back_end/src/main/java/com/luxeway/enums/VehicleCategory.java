package com.luxeway.enums;

public enum VehicleCategory {
    // ====== CAR CATEGORIES ======
    ECONOMY("Economy"),
    SEDAN("Sedan"),
    SUV("SUV"),
    MPV("MPV"),
    LUXURY("Luxury"),
    BUSINESS("Business"),
    ELECTRIC_CAR("Electric Car"),
    SPORTS("Sports"),
    PICKUP("Pickup"),

    // ====== MOTORBIKE CATEGORIES ======
    SCOOTER("Scooter"),
    AUTOMATIC_SCOOTER("Automatic Scooter"),
    MANUAL_MOTORCYCLE("Manual Motorcycle"),
    SPORT_BIKE("Sport Bike"),
    TOURING_BIKE("Touring Bike"),
    ADVENTURE_BIKE("Adventure Bike"),
    CLASSIC_BIKE("Classic Bike"),
    ELECTRIC_BIKE("Electric Bike"),

    // ====== LEGACY (kept for backward compatibility) ======
    FAMILY("Family"),
    ELECTRIC("Electric"),
    MOTORBIKE("Motorbike"),
    CITY_CAR("City Car"),
    TOURISM("Tourism");

    private final String displayName;

    VehicleCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isCarCategory() {
        return this == ECONOMY || this == SEDAN || this == SUV || this == MPV
                || this == LUXURY || this == BUSINESS || this == ELECTRIC_CAR
                || this == SPORTS || this == PICKUP || this == FAMILY
                || this == ELECTRIC || this == CITY_CAR || this == TOURISM;
    }

    public boolean isMotorbikeCategory() {
        return this == SCOOTER || this == AUTOMATIC_SCOOTER || this == MANUAL_MOTORCYCLE
                || this == SPORT_BIKE || this == TOURING_BIKE || this == ADVENTURE_BIKE
                || this == CLASSIC_BIKE || this == ELECTRIC_BIKE || this == MOTORBIKE;
    }
}