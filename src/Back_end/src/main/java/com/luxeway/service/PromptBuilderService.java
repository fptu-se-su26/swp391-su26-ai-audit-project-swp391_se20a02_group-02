package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromptBuilderService {

    public String buildSystemPrompt(User user, List<Booking> recentBookings, Booking contextBooking, Vehicle contextVehicle, String currentPage) {
        return buildSystemPrompt(user, recentBookings, contextBooking, contextVehicle, currentPage, null);
    }

    public String buildSystemPrompt(User user, List<Booking> recentBookings, Booking contextBooking, Vehicle contextVehicle, String currentPage, List<Vehicle> realDbVehicles) {
        StringBuilder sb = new StringBuilder();
        
        // 1. Luxury Persona & Tone Guidance
        sb.append("You are the LuxeWay Luxury Concierge, an elite AI advisor representing LuxeWay, the premier high-end vehicle rental platform.\n");
        sb.append("Tone constraints: Extremely professional, polite, elegant, warm, and highly helpful. Use elite terminology. Address the user by name if known.\n\n");

        // 2. Strict Boundary Rules: Cars vs Motorbikes
        sb.append("CRITICAL ARCHITECTURE RULES (SEPARATION OF ECOSYSTEMS):\n");
        sb.append("- LuxeWay operates TWO completely independent marketplaces: CARS and MOTORBIKES.\n");
        sb.append("- DO NOT suggest motorbikes when the user is searching for or viewing a car. Keep recommendations specific to the category.\n");
        sb.append("- Pathing rules:\n");
        sb.append("  * Car details & marketplace: /cars and /cars/:id\n");
        sb.append("  * Car booking: /car-booking/:id\n");
        sb.append("  * Motorbike details & marketplace: /motorbikes and /motorbikes/:id\n");
        sb.append("  * Motorbike booking: /motorbike-booking/:id\n\n");

        // 3. User Identity Context
        if (user != null) {
            String name = (user.getDisplayName() != null) ? user.getDisplayName() : (user.getFirstName() + " " + user.getLastName());
            sb.append("Renter Information:\n");
            sb.append("- Name: ").append(name).append("\n");
            sb.append("- Email: ").append(user.getEmail()).append("\n");
            sb.append("- Tier: ").append(user.getRole().toString()).append("\n\n");
        } else {
            sb.append("Renter Information: Unauthenticated Guest\n\n");
        }

        // 4. Page Coordinate Context
        if (currentPage != null && !currentPage.trim().isEmpty()) {
            sb.append("Renter Current Location on LuxeWay App: ").append(currentPage).append("\n\n");
        }

        // 5. Active Context Vehicle Specs
        if (contextVehicle != null) {
            sb.append("Active Vehicle Being Viewed:\n");
            sb.append("- ID: ").append(contextVehicle.getId()).append("\n");
            sb.append("- Name: ").append(contextVehicle.getName()).append("\n");
            sb.append("- Brand/Model: ").append(contextVehicle.getBrand()).append(" ").append(contextVehicle.getModel()).append("\n");
            sb.append("- Category: ").append(contextVehicle.getCategory().toString()).append("\n");
            sb.append("- Type: ").append(contextVehicle.getVehicleType().toString()).append("\n");
            sb.append("- Cost: ").append(contextVehicle.getPricePerDay()).append(" VND per day\n");
            if (contextVehicle.getDescription() != null) {
                sb.append("- Overview: ").append(contextVehicle.getDescription()).append("\n");
            }
            sb.append("\n");
        }

        // Real DB Inventory Injection
        if (realDbVehicles != null && !realDbVehicles.isEmpty()) {
            sb.append("LuxeWay Real Available Database Inventory Snapshot:\n");
            for (Vehicle v : realDbVehicles) {
                sb.append("- [ID: ").append(v.getId()).append("] ")
                        .append(v.getBrand() != null ? v.getBrand() : "").append(" ").append(v.getName())
                        .append(" | Category: ").append(v.getCategory())
                        .append(" | City: ").append(v.getCity() != null ? v.getCity() : "Việt Nam")
                        .append(" | Price: ").append(v.getPricePerDay()).append(" VND/day")
                        .append(" | Rating: ").append(v.getRating() != null ? v.getRating() : 5.0)
                        .append("\n");
            }
            sb.append("\n");
        }

        // 6. Active Context Booking Details
        if (contextBooking != null) {
            sb.append("Active Rental Booking Details:\n");
            sb.append("- Booking Reference ID: ").append(contextBooking.getId()).append("\n");
            if (contextBooking.getVehicle() != null) {
                sb.append("- Vehicle: ").append(contextBooking.getVehicle().getName()).append(" (").append(contextBooking.getVehicle().getVehicleType().toString()).append(")\n");
            }
            sb.append("- Status: ").append(contextBooking.getStatus().toString()).append("\n");
            sb.append("- Rental Period: ").append(contextBooking.getStartDate()).append(" to ").append(contextBooking.getEndDate()).append("\n");
            sb.append("- Renter Total Cost: ").append(contextBooking.getTotal()).append(" VND\n\n");
        }

        // 7. Historical Bookings
        if (recentBookings != null && !recentBookings.isEmpty()) {
            sb.append("Renter Booking History:\n");
            for (Booking b : recentBookings) {
                sb.append("- ID: ").append(b.getId())
                        .append(" | ").append(b.getVehicle() != null ? b.getVehicle().getName() : "Vehicle")
                        .append(" | Status: ").append(b.getStatus())
                        .append(" | Period: ").append(b.getStartDate()).append(" to ").append(b.getEndDate())
                        .append("\n");
            }
            sb.append("\n");
        }

        // 8. Multi-Language & Scope Rules
        sb.append("CRITICAL LANGUAGE & SCOPE RULES:\n");
        sb.append("1. MULTI-LANGUAGE: You MUST detect the language of the user's latest prompt (English 🇬🇧, Vietnamese 🇻🇳, Chinese 🇨🇳, Korean 🇰🇷, Japanese 🇯🇵, etc.) and ALWAYS reply in the EXACT SAME LANGUAGE as the user's prompt.\n");
        sb.append("2. DOMAIN BOUNDARY & OFF-TOPIC RULE: You are exclusively the LuxeWay AI Concierge. You ONLY answer questions related to vehicle rentals, recommendations, bookings, roadside emergency help, host/owner vehicle approvals & earnings, and admin system metrics on the LuxeWay platform. If the user asks off-topic, silly, or unrelated questions (such as general trivia, weather, politics, math, poems, non-platform matters), politely decline in their language and state that you are the LuxeWay AI assistant and can only help with LuxeWay vehicle rental platform services.\n");
        sb.append("3. REAL DATABASE RECORDS: All vehicle details, booking codes, status updates, and statistics come directly from LuxeWay's real database. Never fabricate fake vehicles, fake prices, or fake locations.\n\n");

        sb.append("Please respond politely in Markdown. Keep your dialogue concise, structured, and luxurious. Maximum 200 words.");

        return sb.toString();
    }
}
