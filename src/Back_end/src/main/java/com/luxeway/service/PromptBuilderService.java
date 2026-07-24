package com.luxeway.service;

import com.luxeway.dto.ai.AIChatContextDTOs.*;
import com.luxeway.entity.User;
import com.luxeway.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromptBuilderService {

    public String buildRoleSystemPrompt(User user, CustomerContextDTO customerCtx, OwnerContextDTO ownerCtx, AdminContextDTO adminCtx, String currentPage, String lang) {
        StringBuilder sb = new StringBuilder();
        UserRole role = user != null ? user.getRole() : UserRole.CUSTOMER;

        sb.append("You are LuxeWay AI Concierge.\n");
        sb.append("Current user role: ").append(role.name()).append(".\n\n");
        sb.append("You help users with the LuxeWay vehicle rental platform.\n\n");
        sb.append("Rules:\n");
        sb.append("- Answer based only on the provided system data.\n");
        sb.append("- Never invent vehicles, prices, bookings, payments, or users.\n");
        sb.append("- If the information is not available, say you cannot find it.\n");
        sb.append("- Use simple, professional, and friendly language.\n");
        sb.append("- Support English, Vietnamese, Chinese, Korean, and Japanese.\n");
        sb.append("- Reply in the exact same language as the user's message.\n\n");

        sb.append("User data:\n");

        if (role == UserRole.ADMIN && adminCtx != null) {
            sb.append("- Total Platform Users: ").append(adminCtx.getTotalUsers()).append("\n");
            sb.append("- Total Fleet Vehicles: ").append(adminCtx.getTotalVehicles()).append("\n");
            sb.append("- Total Bookings: ").append(adminCtx.getTotalBookings()).append("\n");
            sb.append("- Today's New Bookings Count: ").append(adminCtx.getTodayBookingsCount()).append("\n");
            sb.append("- Pending KYC Applications Count: ").append(adminCtx.getPendingKycCount()).append("\n");
            if (adminCtx.getPendingKycUsers() != null && !adminCtx.getPendingKycUsers().isEmpty()) {
                sb.append("  Pending KYC Users List: ").append(adminCtx.getPendingKycUsers()).append("\n");
            }
            sb.append("- Pending Owner Applications Count: ").append(adminCtx.getPendingOwnerAppsCount()).append("\n");
            if (adminCtx.getPendingOwnerApplications() != null && !adminCtx.getPendingOwnerApplications().isEmpty()) {
                sb.append("  Pending Owner Applications List: ").append(adminCtx.getPendingOwnerApplications()).append("\n");
            }
            sb.append("- Pending Vehicle Approvals Count: ").append(adminCtx.getPendingVehicleApprovalsCount()).append("\n");
            if (adminCtx.getPendingVehicleApprovals() != null && !adminCtx.getPendingVehicleApprovals().isEmpty()) {
                sb.append("  Vehicles Awaiting Approval: ").append(adminCtx.getPendingVehicleApprovals()).append("\n");
            }
            sb.append("- Unresolved Disputes Count: ").append(adminCtx.getUnresolvedDisputesCount()).append("\n");

        } else if (role == UserRole.OWNER && ownerCtx != null) {
            sb.append("- Owner Display Name: ").append(ownerCtx.getDisplayName()).append(" (Email: ").append(ownerCtx.getEmail()).append(")\n");
            sb.append("- Total Vehicles in Fleet: ").append(ownerCtx.getTotalVehicles()).append("\n");
            sb.append("- Vehicles Available for Rent: ").append(ownerCtx.getAvailableVehicles()).append("\n");
            sb.append("- Vehicles Pending Admin Approval: ").append(ownerCtx.getPendingApprovalVehicles()).append("\n");
            sb.append("- Total Bookings Received: ").append(ownerCtx.getTotalBookings()).append("\n");
            sb.append("- Pending Booking Requests: ").append(ownerCtx.getPendingRequestsCount()).append("\n");
            sb.append("- Total Earned Revenue: ").append(ownerCtx.getTotalRevenue()).append(" VND\n");
            sb.append("- Owner Rating: ").append(ownerCtx.getRating()).append("/5.0 (").append(ownerCtx.getTotalReviews()).append(" reviews)\n");
            if (ownerCtx.getVehicles() != null && !ownerCtx.getVehicles().isEmpty()) {
                sb.append("- Owner Vehicles List (Name, Status, ApprovalStatus, RejectionReason, Price/Day): ").append(ownerCtx.getVehicles()).append("\n");
            }
            if (ownerCtx.getPendingRequests() != null && !ownerCtx.getPendingRequests().isEmpty()) {
                sb.append("- Pending Booking Requests List: ").append(ownerCtx.getPendingRequests()).append("\n");
            }

        } else if (customerCtx != null) {
            sb.append("- Customer Name: ").append(customerCtx.getDisplayName()).append(" (Email: ").append(customerCtx.getEmail()).append(")\n");
            sb.append("- KYC Status: ").append(customerCtx.getKycStatus()).append(" (Verified: ").append(customerCtx.isKycVerified()).append(")\n");
            sb.append("- Driver License Status: ").append(customerCtx.getLicenseStatus()).append("\n");
            sb.append("- Total Bookings Made: ").append(customerCtx.getTotalBookings()).append("\n");
            sb.append("- Active Rentals Count: ").append(customerCtx.getActiveBookingsCount()).append("\n");
            sb.append("- Total Spent Amount: ").append(customerCtx.getTotalSpent()).append(" VND\n");
            sb.append("- Wallet Balance: ").append(customerCtx.getWalletBalance()).append(" VND\n");
            if (customerCtx.getRecentBookings() != null && !customerCtx.getRecentBookings().isEmpty()) {
                sb.append("- Recent Bookings List (Code, Vehicle, Status, Dates, Total): ").append(customerCtx.getRecentBookings()).append("\n");
            }
            if (customerCtx.getActiveBookings() != null && !customerCtx.getActiveBookings().isEmpty()) {
                sb.append("- Active Bookings List: ").append(customerCtx.getActiveBookings()).append("\n");
            }
            if (customerCtx.getRecentPayments() != null && !customerCtx.getRecentPayments().isEmpty()) {
                sb.append("- Recent Payments List: ").append(customerCtx.getRecentPayments()).append("\n");
            }
            if (customerCtx.getAvailableVehiclesForRent() != null && !customerCtx.getAvailableVehiclesForRent().isEmpty()) {
                sb.append("- Featured Available Vehicles for Rent (Name, Brand, Model, Price/Day, Location): ").append(customerCtx.getAvailableVehiclesForRent()).append("\n");
            }
        }

        if (currentPage != null && !currentPage.trim().isEmpty()) {
            sb.append("- User Current Web Page Location: ").append(currentPage).append("\n");
        }

        return sb.toString();
    }
}
