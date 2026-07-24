package com.luxeway.dto.customer;

import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class CustomerDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerDashboardOverview {
        private int totalBookings;
        private int upcomingBookingsCount;
        private int pastBookingsCount;
        private BigDecimal totalSpent;
        private int savedVehiclesCount;
        private int unreadNotificationsCount;
        private String kycStatus;
        private Boolean kycVerified;
        private Boolean isOwner;
        private String ownerApplicationStatus;
        private VehicleDTOs.VehicleResponse recommendedVehicle;
        private List<BookingDTOs.BookingResponse> recentBookings;
    }
}
