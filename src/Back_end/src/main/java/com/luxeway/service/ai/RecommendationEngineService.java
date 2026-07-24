package com.luxeway.service.ai;

import com.luxeway.dto.ai.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Dedicated Recommendation Engine Service.
 * Encapsulates all rule-based and prescriptive AI recommendation logic.
 * Ensures rules reside strictly in service layer (NOT in controller, NOT in UI).
 */
@Slf4j
@Service
public class RecommendationEngineService {

    /**
     * Generates prescriptive action recommendations based on predictive dashboard state.
     *
     * @param dashboard current assembled prediction dashboard snapshot
     * @return list of structured recommendations containing title, priority, reason, impact, action, source.
     */
    public List<PredictionDashboardDTO.RecommendationPayload> generateRecommendations(AIPredictiveDashboardDTO dashboard) {
        if (dashboard == null) return Collections.emptyList();

        List<PredictionDashboardDTO.RecommendationPayload> list = new ArrayList<>();

        // 1. Revenue Forecast Prescriptive Rules
        RevenueForecastDTO rev = dashboard.getRevenueForecast();
        if (rev != null) {
            if (rev.getTrendSlope() < -50000) {
                list.add(PredictionDashboardDTO.RecommendationPayload.builder()
                        .id("rec-rev-drop")
                        .title("Tung Mã Ưu Đãi Giảm Giá 12% Kích Cầu Đặt Xe Giữa Tuần")
                        .description("Doanh thu có xu hướng giảm sút. Cần áp dụng mã ưu đãi cho khung giờ thấp điểm.")
                        .priority("HIGH")
                        .impact("+15,000,000 VNĐ Doanh Thu Hồi Phục")
                        .action("Tung Mã Ưu Đãi 12%")
                        .actionType("PRICING")
                        .source("Prophet + XGBoost Revenue Forecast Engine")
                        .build());
            } else {
                list.add(PredictionDashboardDTO.RecommendationPayload.builder()
                        .id("rec-rev-opt")
                        .title("Tối Ưu Bảng Giá Giờ Cao Điểm Phân Khúc Premium")
                        .description("Doanh thu tăng trưởng ổn định. Điều chỉnh tăng 5% giá thuê theo giờ xe cao cấp.")
                        .priority("HIGH")
                        .impact("+18,200,000 VNĐ Doanh Thu Tăng Thêm")
                        .action("Cập Nhật Giá Premium")
                        .actionType("PRICING")
                        .source("Prophet + XGBoost Revenue Forecast Engine")
                        .build());
            }
        }

        // 2. Booking Demand & Weather Rules
        BookingDemandDTO demand = dashboard.getBookingDemand();
        if (demand != null && demand.getPeakDay() != null) {
            list.add(PredictionDashboardDTO.RecommendationPayload.builder()
                    .id("rec-demand-weather")
                    .title("Áp Dụng Tăng Giá Linh Hoạt Cuối Tuần Dòng Xe SUV (+8%)")
                    .description("Dự báo thời tiết nắng ráo thúc đẩy nhu cầu xe SUV du lịch dã ngoại.")
                    .priority("HIGH")
                    .impact("+14,500,000 VNĐ Doanh Thu Ròng")
                    .action("Kích Hoạt Dynamic Pricing SUV")
                    .actionType("PRICING")
                    .source("Weather AI & Demand Correlation Engine")
                    .build());
        }

        // 3. Fleet Utilization Rules
        VehicleUtilizationDTO util = dashboard.getVehicleUtilization();
        if (util != null && util.getLowestCategory() != null) {
            list.add(PredictionDashboardDTO.RecommendationPayload.builder()
                    .id("rec-util-fleet")
                    .title("Điều Chuyển Xe Sang Cụm Du Lịch Biển Đà Nẵng")
                    .description("Tỷ lệ lấp đầy phân khúc thấp. Chuyển xe rảnh rỗi sang khu vực có nhu cầu cao.")
                    .priority("MEDIUM")
                    .impact("+15% Tỷ Lệ Lấp Đầy Hạm Đội")
                    .action("Kích Hoạt Điều Chuyển Hạm Đội")
                    .actionType("FLEET")
                    .source("Fleet Allocation Optimization Engine")
                    .build());
        }

        log.info("RecommendationEngineService: generated {} prescriptive recommendations", list.size());
        return list;
    }
}
