package com.luxeway.service.ai;

import com.luxeway.dto.ai.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * HTTP client for the Python ML sidecar service.
 * On any network/connectivity error it delegates to {@link JavaFallbackService}.
 *
 * All POST requests send a JSON body; all GET requests carry no body.
 */
@Slf4j
@Component
public class MLSidecarClient {

    private final RestTemplate restTemplate;
    private final JavaFallbackService fallback;
    private final String baseUrl;

    public MLSidecarClient(
            RestTemplate mlRestTemplate,
            JavaFallbackService fallback,
            @Value("${ml.service.url:http://localhost:8000}") String baseUrl) {
        this.restTemplate = mlRestTemplate;
        this.fallback = fallback;
        this.baseUrl = baseUrl;
    }

    // ---------------------------------------------------------------- health

    /** Returns true when the sidecar is reachable and healthy. */
    public boolean isHealthy() {
        try {
            Map<?, ?> resp = restTemplate.getForObject(baseUrl + "/ml/health", Map.class);
            return resp != null && "ok".equals(resp.get("status"));
        } catch (Exception ex) {
            log.warn("ML sidecar health check failed: {}", ex.getMessage());
            return false;
        }
    }

    // ---------------------------------------------------------------- revenue

    public RevenueForecastDTO forecastRevenue(List<AnalyticsDataPoint> data, int horizon) {
        try {
            Map<String, Object> body = Map.of("data", data, "horizon", horizon);
            RevenueForecastDTO resp = restTemplate.postForObject(
                    baseUrl + "/ml/revenue/forecast", body, RevenueForecastDTO.class);
            return resp != null ? resp : fallback.forecastRevenue(data, horizon);
        } catch (RestClientException ex) {
            log.warn("ML sidecar forecastRevenue failed, using fallback: {}", ex.getMessage());
            return fallback.forecastRevenue(data, horizon);
        }
    }

    // ---------------------------------------------------------------- demand

    public BookingDemandDTO forecastDemand(List<AnalyticsDataPoint> data, int horizon) {
        try {
            Map<String, Object> body = Map.of("data", data, "horizon", horizon);
            BookingDemandDTO resp = restTemplate.postForObject(
                    baseUrl + "/ml/bookings/demand", body, BookingDemandDTO.class);
            return resp != null ? resp : fallback.forecastDemand(data, horizon);
        } catch (RestClientException ex) {
            log.warn("ML sidecar forecastDemand failed, using fallback: {}", ex.getMessage());
            return fallback.forecastDemand(data, horizon);
        }
    }

    // ---------------------------------------------------------------- utilization

    public VehicleUtilizationDTO forecastUtilization(Map<String, List<Double>> byCategory, int forecastDays) {
        try {
            Map<String, Object> body = Map.of("by_category", byCategory, "forecast_days", forecastDays);
            VehicleUtilizationDTO resp = restTemplate.postForObject(
                    baseUrl + "/ml/vehicles/utilization", body, VehicleUtilizationDTO.class);
            return resp != null ? resp : fallback.forecastUtilization(byCategory, forecastDays);
        } catch (RestClientException ex) {
            log.warn("ML sidecar forecastUtilization failed, using fallback: {}", ex.getMessage());
            return fallback.forecastUtilization(byCategory, forecastDays);
        }
    }

    // ---------------------------------------------------------------- churn

    public List<ChurnRiskDTO> scoreChurn(
            List<CustomerDataPoint> customers,
            double platformAvgFrequency,
            double platformAvgSpend) {
        try {
            Map<String, Object> body = Map.of(
                    "customers", customers,
                    "platform_avg_frequency", platformAvgFrequency,
                    "platform_avg_spend", platformAvgSpend);
            ChurnResponseWrapper resp = restTemplate.postForObject(
                    baseUrl + "/ml/churn/score", body, ChurnResponseWrapper.class);
            if (resp != null && resp.getResults() != null) {
                return resp.getResults();
            }
            return fallback.scoreChurn(customers);
        } catch (RestClientException ex) {
            log.warn("ML sidecar scoreChurn failed, using fallback: {}", ex.getMessage());
            return fallback.scoreChurn(customers);
        }
    }

    // ---------------------------------------------------------------- anomaly

    public List<AnomalyDTO> detectAnomalies(List<AnalyticsDataPoint> data) {
        try {
            Map<String, Object> body = Map.of("data", data);
            AnomalyResponseWrapper resp = restTemplate.postForObject(
                    baseUrl + "/ml/anomalies/detect", body, AnomalyResponseWrapper.class);
            if (resp != null && resp.getAnomalies() != null) {
                return resp.getAnomalies();
            }
            return fallback.detectAnomalies(data);
        } catch (RestClientException ex) {
            log.warn("ML sidecar detectAnomalies failed, using fallback: {}", ex.getMessage());
            return fallback.detectAnomalies(data);
        }
    }

    // ---------------------------------------------------------------- inner wrapper classes

    /** Wrapper to deserialize {"results": [...]} from the churn endpoint. */
    public static class ChurnResponseWrapper {
        private List<ChurnRiskDTO> results;
        public List<ChurnRiskDTO> getResults() { return results; }
        public void setResults(List<ChurnRiskDTO> results) { this.results = results; }
    }

    /** Wrapper to deserialize {"anomalies": [...]} from the anomaly endpoint. */
    public static class AnomalyResponseWrapper {
        private List<AnomalyDTO> anomalies;
        public List<AnomalyDTO> getAnomalies() { return anomalies; }
        public void setAnomalies(List<AnomalyDTO> anomalies) { this.anomalies = anomalies; }
    }
}
