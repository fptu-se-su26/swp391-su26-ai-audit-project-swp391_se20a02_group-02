package com.luxeway.dto.car;

import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

public class CarDTOs {

    @Data
    public static class CreateCarRequest {
        private String modelId;
        private String name;
        private String licensePlate;
        private BigDecimal pricePerDay;
        private BigDecimal deposit;
        private String city;
        private String address;
        private Double latitude;
        private Double longitude;
        
        // Spec details
        private Integer seats;
        private Integer doors;
        private TransmissionType transmission;
        private FuelType fuelType;
        private Boolean hasChauffeur;
        private Boolean airportDelivery;
        private Boolean electric;
        private Boolean hybrid;
        
        private List<String> imageUrls;
    }

    @Data
    public static class CarResponse {
        private String id;
        private String name;
        private String brandName;
        private String modelName;
        private String category;
        private String licensePlate;
        private BigDecimal pricePerDay;
        private BigDecimal deposit;
        private String status;
        private Double rating;
        private Integer totalReviews;
        
        private String city;
        private String address;
        private Double latitude;
        private Double longitude;

        // Specs
        private Integer seats;
        private Integer doors;
        private String transmission;
        private String fuelType;
        private Boolean hasChauffeur;
        private Boolean airportDelivery;
        private Boolean electric;
        private Boolean hybrid;

        private List<String> images;
        private OwnerInfo owner;
    }

    @Data
    public static class OwnerInfo {
        private String id;
        private String displayName;
        private String avatar;
    }
}
