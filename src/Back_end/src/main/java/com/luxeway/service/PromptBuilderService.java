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
        String selectedLang = (lang != null && !lang.trim().isEmpty()) ? lang : "en";
        UserRole role = user != null ? user.getRole() : UserRole.CUSTOMER;

        if (role == UserRole.ADMIN) {
            sb.append("You are LuxeWay Admin Operations Assistant.\n");
            sb.append("You assist an authenticated ADMIN user.\n");
            sb.append("You may summarize platform-level data provided by the backend.\n");
            sb.append("Never invent statistics.\n");
            sb.append("Never execute destructive or approval actions directly without explicit confirmation and backend authorization.\n");
            sb.append("All actions must be logged in the AuditLog system.\n");
            sb.append("Respond strictly in the user's selected language: ").append(selectedLang).append(".\n\n");

            if (adminCtx != null) {
                sb.append("REAL DATABASE PLATFORM CONTEXT:\n");
                sb.append("- Total Platform Users: ").append(adminCtx.getTotalUsers()).append("\n");
                sb.append("- Total Fleet Vehicles: ").append(adminCtx.getTotalVehicles()).append("\n");
                sb.append("- Total Bookings: ").append(adminCtx.getTotalBookings()).append("\n");
                sb.append("- Pending KYC Applications: ").append(adminCtx.getPendingKycCount()).append("\n");
                sb.append("- Pending Owner Applications: ").append(adminCtx.getPendingOwnerAppsCount()).append("\n");
                sb.append("- Pending Vehicle Approvals: ").append(adminCtx.getPendingVehicleApprovalsCount()).append("\n");
                sb.append("- Unresolved Disputes: ").append(adminCtx.getUnresolvedDisputesCount()).append("\n");
                if (adminCtx.getPendingVehicleApprovals() != null && !adminCtx.getPendingVehicleApprovals().isEmpty()) {
                    sb.append("- Vehicles Awaiting Approval: ").append(adminCtx.getPendingVehicleApprovals()).append("\n");
                }
                sb.append("\n");
            }
        } else if (role == UserRole.OWNER) {
            sb.append("You are LuxeWay Owner Assistant.\n");
            sb.append("You assist the authenticated vehicle owner.\n");
            sb.append("You may access only the owner's vehicles, bookings, earnings, reviews, withdrawals, and approval information provided by the backend.\n");
            sb.append("Never reveal another owner's private data.\n");
            sb.append("Never invent revenue, booking, or vehicle information.\n");
            sb.append("You cannot bypass Admin approval.\n");
            sb.append("A vehicle must remain unavailable while waiting for Admin re-approval.\n");
            sb.append("Respond strictly in the user's selected language: ").append(selectedLang).append(".\n\n");

            if (ownerCtx != null) {
                sb.append("REAL DATABASE OWNER FLEET & BUSINESS CONTEXT:\n");
                sb.append("- Owner Name: ").append(ownerCtx.getDisplayName()).append("\n");
                sb.append("- Total Vehicles: ").append(ownerCtx.getTotalVehicles()).append("\n");
                sb.append("- Available Vehicles: ").append(ownerCtx.getAvailableVehicles()).append("\n");
                sb.append("- Vehicles Pending Admin Approval: ").append(ownerCtx.getPendingApprovalVehicles()).append("\n");
                sb.append("- Total Bookings Received: ").append(ownerCtx.getTotalBookings()).append("\n");
                sb.append("- Pending Customer Booking Requests: ").append(ownerCtx.getPendingRequestsCount()).append("\n");
                sb.append("- Total Earnings/Revenue: ").append(ownerCtx.getTotalRevenue()).append(" VND\n");
                sb.append("- Average Rating: ").append(ownerCtx.getRating()).append("/5 (").append(ownerCtx.getTotalReviews()).append(" reviews)\n");
                if (ownerCtx.getVehicles() != null && !ownerCtx.getVehicles().isEmpty()) {
                    sb.append("- Owned Vehicles Summary: ").append(ownerCtx.getVehicles()).append("\n");
                }
                if (ownerCtx.getPendingRequests() != null && !ownerCtx.getPendingRequests().isEmpty()) {
                    sb.append("- Pending Booking Requests: ").append(ownerCtx.getPendingRequests()).append("\n");
                }
                sb.append("\n");
            }
        } else {
            sb.append("You are LuxeWay Customer Assistant.\n");
            sb.append("You assist the authenticated customer only.\n");
            sb.append("You may answer questions using the provided customer context.\n");
            sb.append("Never reveal data belonging to other users.\n");
            sb.append("Never invent booking, payment, vehicle, or account information.\n");
            sb.append("If data is missing, clearly state: 'I couldn't find any matching data in the LuxeWay system.'\n");
            sb.append("You cannot approve, reject, modify, delete, or refund anything without an authorized backend operation.\n");
            sb.append("Respond strictly in the user's selected language: ").append(selectedLang).append(".\n\n");

            if (customerCtx != null) {
                sb.append("REAL DATABASE CUSTOMER ACCOUNT CONTEXT:\n");
                sb.append("- Customer Name: ").append(customerCtx.getDisplayName()).append("\n");
                sb.append("- Email: ").append(customerCtx.getEmail()).append("\n");
                sb.append("- KYC Status: ").append(customerCtx.getKycStatus()).append(" (Verified: ").append(customerCtx.isKycVerified()).append(")\n");
                sb.append("- Driving License: ").append(customerCtx.getLicenseStatus()).append("\n");
                sb.append("- Total Bookings Made: ").append(customerCtx.getTotalBookings()).append("\n");
                sb.append("- Active Rentals: ").append(customerCtx.getActiveBookingsCount()).append("\n");
                sb.append("- Total Spent: ").append(customerCtx.getTotalSpent()).append(" VND\n");
                if (customerCtx.getRecentBookings() != null && !customerCtx.getRecentBookings().isEmpty()) {
                    sb.append("- Recent Bookings: ").append(customerCtx.getRecentBookings()).append("\n");
                }
                if (customerCtx.getRecentPayments() != null && !customerCtx.getRecentPayments().isEmpty()) {
                    sb.append("- Recent Payments: ").append(customerCtx.getRecentPayments()).append("\n");
                }
                sb.append("\n");
            }
        }

        if (currentPage != null && !currentPage.trim().isEmpty()) {
            sb.append("User Current App Location Page: ").append(currentPage).append("\n\n");
        }

        return sb.toString();
    }
}
