package com.luxeway.dto.motorbike;

import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

public class MotorbikeDTOs {

    @Data
    public static class CreateMotorbikeRequest {
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
        private Integer engineCc;
        private TransmissionType transmission;
        private Boolean helmetIncluded;
        private Boolean raincoatIncluded;
        private Boolean phoneHolder;
        private Boolean luggageRack;
        
        private List<String> imageUrls;
    }

    @Data
    public static class MotorbikeResponse {
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
        private Integer engineCc;
        private String transmission;
        private Boolean helmetIncluded;
        private Boolean raincoatIncluded;
        private Boolean phoneHolder;
        private Boolean luggageRack;

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
