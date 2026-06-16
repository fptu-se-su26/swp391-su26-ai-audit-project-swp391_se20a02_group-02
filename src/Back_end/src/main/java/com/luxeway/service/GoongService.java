package com.luxeway.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Service
@SuppressWarnings("all")
public class GoongService {

    @Value("${goong.api-key:mock_goong_key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean isMock() {
        return apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("mock_");
    }

    /**
     * Geocode address to LatLng.
     */
    public Map<String, Object> geocode(String address) {
        if (isMock()) {
            log.info("Goong API Key is mock. Using geocode simulation.");
            Map<String, Object> result = new HashMap<>();
            result.put("address", address);
            // Default simulated coordinate (Vincom Center Dong Khoi)
            result.put("lat", new BigDecimal("10.777934"));
            result.put("lng", new BigDecimal("106.702002"));
            return result;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://rsapi.goong.io/Geocode")
                    .queryParam("address", address)
                    .queryParam("api_key", apiKey)
                    .build().toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results != null && !results.isEmpty()) {
                Map<String, Object> first = results.get(0);
                Map<String, Object> geometry = (Map<String, Object>) first.get("geometry");
                Map<String, Object> location = (Map<String, Object>) geometry.get("location");
                
                Map<String, Object> output = new HashMap<>();
                output.put("address", first.get("formatted_address"));
                output.put("lat", new BigDecimal(location.get("lat").toString()));
                output.put("lng", new BigDecimal(location.get("lng").toString()));
                return output;
            }
        } catch (Exception e) {
            log.error("Geocoding failed for: {}", address, e);
        }

        // Return fallback if API fails
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("address", address);
        fallback.put("lat", new BigDecimal("21.0285"));
        fallback.put("lng", new BigDecimal("105.8542"));
        return fallback;
    }

    /**
     * Reverse geocode LatLng to address.
     */
    public Map<String, Object> reverseGeocode(BigDecimal lat, BigDecimal lng) {
        if (isMock()) {
            log.info("Goong API Key is mock. Using reverse geocode simulation.");
            Map<String, Object> result = new HashMap<>();
            result.put("lat", lat);
            result.put("lng", lng);
            result.put("address", "Vincom Center, 72 Le Thanh Ton, District 1, Ho Chi Minh City");
            return result;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://rsapi.goong.io/Geocode")
                    .queryParam("latlng", lat.toString() + "," + lng.toString())
                    .queryParam("api_key", apiKey)
                    .build().toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results != null && !results.isEmpty()) {
                Map<String, Object> first = results.get(0);
                Map<String, Object> output = new HashMap<>();
                output.put("address", first.get("formatted_address"));
                output.put("lat", lat);
                output.put("lng", lng);
                return output;
            }
        } catch (Exception e) {
            log.error("Reverse geocoding failed for lat: {}, lng: {}", lat, lng, e);
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("lat", lat);
        fallback.put("lng", lng);
        fallback.put("address", "Latitude: " + lat + ", Longitude: " + lng);
        return fallback;
    }

    /**
     * Get Directions, polyline route, distance, duration.
     */
    public Map<String, Object> getDirection(BigDecimal originLat, BigDecimal originLng, BigDecimal destLat, BigDecimal destLng) {
        if (isMock()) {
            log.info("Goong API Key is mock. Using directions simulation.");
            Map<String, Object> result = new HashMap<>();
            result.put("distance", new BigDecimal("8.5")); // km
            result.put("duration", 1080); // seconds (18 mins)
            result.put("duration_text", "18 minutes");
            result.put("distance_text", "8.5 km");
            
            // Hardcoded polyline for demonstration (coordinates of path from Hoan Kiem to West Lake or Saigon)
            // It represents a line string
            result.put("polyline", "}_axCg~_jSlB`@xDhBbEfChFvD~G|EdIfFdKdG|LjHnMlInNjJnOkKhPkLlQkMrRkNsS");
            return result;
        }

        try {
            String originStr = originLat.toString() + "," + originLng.toString();
            String destStr = destLat.toString() + "," + destLng.toString();
            
            String url = UriComponentsBuilder.fromHttpUrl("https://rsapi.goong.io/Direction")
                    .queryParam("origin", originStr)
                    .queryParam("destination", destStr)
                    .queryParam("vehicle", "car")
                    .queryParam("api_key", apiKey)
                    .build().toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");
            if (routes != null && !routes.isEmpty()) {
                Map<String, Object> firstRoute = routes.get(0);
                List<Map<String, Object>> legs = (List<Map<String, Object>>) firstRoute.get("legs");
                
                Map<String, Object> output = new HashMap<>();
                if (legs != null && !legs.isEmpty()) {
                    Map<String, Object> leg = legs.get(0);
                    Map<String, Object> distanceObj = (Map<String, Object>) leg.get("distance");
                    Map<String, Object> durationObj = (Map<String, Object>) leg.get("duration");
                    
                    output.put("distance", new BigDecimal(distanceObj.get("value").toString()).divide(new BigDecimal("1000"), 2, java.math.RoundingMode.HALF_UP));
                    output.put("duration", Integer.parseInt(durationObj.get("value").toString()));
                    output.put("duration_text", durationObj.get("text"));
                    output.put("distance_text", distanceObj.get("text"));
                }
                
                Map<String, Object> overviewPolyline = (Map<String, Object>) firstRoute.get("overview_polyline");
                if (overviewPolyline != null) {
                    output.put("polyline", overviewPolyline.get("points"));
                }
                return output;
            }
        } catch (Exception e) {
            log.error("Directions failed", e);
        }

        // Return baseline fallback
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("distance", new BigDecimal("5.0"));
        fallback.put("duration", 600);
        fallback.put("duration_text", "10 minutes");
        fallback.put("distance_text", "5.0 km");
        fallback.put("polyline", "}_axCg~_jSlB`@xDhBbEfChFvD~G|EdIfFdKdG|LjHnMlInNjJnOkKhPkLlQkMrRkNsS");
        return fallback;
    }

    /**
     * Autocomplete address suggestions.
     */
    public List<Map<String, Object>> autocomplete(String input) {
        if (isMock()) {
            log.info("Goong API Key is mock. Using autocomplete simulation.");
            List<Map<String, Object>> list = new ArrayList<>();
            
            Map<String, Object> opt1 = new HashMap<>();
            opt1.put("place_id", "mock_place_1");
            opt1.put("description", "Vincom Center Dong Khoi, District 1, HCMC");
            opt1.put("main_text", "Vincom Center Dong Khoi");
            opt1.put("secondary_text", "District 1, HCMC");
            
            Map<String, Object> opt2 = new HashMap<>();
            opt2.put("place_id", "mock_place_2");
            opt2.put("description", "Landmark 81, Binh Thanh District, HCMC");
            opt2.put("main_text", "Landmark 81");
            opt2.put("secondary_text", "Binh Thanh District, HCMC");

            Map<String, Object> opt3 = new HashMap<>();
            opt3.put("place_id", "mock_place_3");
            opt3.put("description", "Tan Son Nhat International Airport, Tan Binh, HCMC");
            opt3.put("main_text", "Tan Son Nhat Airport");
            opt3.put("secondary_text", "Tan Binh, HCMC");
            
            list.add(opt1);
            list.add(opt2);
            list.add(opt3);
            return list;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://rsapi.goong.io/Place/AutoComplete")
                    .queryParam("input", input)
                    .queryParam("api_key", apiKey)
                    .build().toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
            if (predictions != null) {
                List<Map<String, Object>> output = new ArrayList<>();
                for (Map<String, Object> p : predictions) {
                    Map<String, Object> opt = new HashMap<>();
                    opt.put("place_id", p.get("place_id"));
                    opt.put("description", p.get("description"));
                    Map<String, Object> structured = (Map<String, Object>) p.get("structured_formatting");
                    if (structured != null) {
                        opt.put("main_text", structured.get("main_text"));
                        opt.put("secondary_text", structured.get("secondary_text"));
                    }
                    output.add(opt);
                }
                return output;
            }
        } catch (Exception e) {
            log.error("Autocomplete failed", e);
        }
        return Collections.emptyList();
    }

    /**
     * Retrieve LatLng from Place ID.
     */
    public Map<String, Object> getPlaceDetail(String placeId) {
        if (isMock() || placeId.startsWith("mock_")) {
            log.info("Goong API Key is mock. Using place detail simulation.");
            Map<String, Object> result = new HashMap<>();
            result.put("place_id", placeId);
            if (placeId.endsWith("1")) {
                result.put("address", "Vincom Center Dong Khoi, District 1, HCMC");
                result.put("lat", new BigDecimal("10.777934"));
                result.put("lng", new BigDecimal("106.702002"));
            } else if (placeId.endsWith("2")) {
                result.put("address", "Landmark 81, Binh Thanh District, HCMC");
                result.put("lat", new BigDecimal("10.794715"));
                result.put("lng", new BigDecimal("106.721835"));
            } else {
                result.put("address", "Tan Son Nhat International Airport, Tan Binh, HCMC");
                result.put("lat", new BigDecimal("10.818451"));
                result.put("lng", new BigDecimal("106.660172"));
            }
            return result;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://rsapi.goong.io/Place/Detail")
                    .queryParam("place_id", placeId)
                    .queryParam("api_key", apiKey)
                    .build().toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            Map<String, Object> result = (Map<String, Object>) response.get("result");
            if (result != null) {
                Map<String, Object> geometry = (Map<String, Object>) result.get("geometry");
                Map<String, Object> location = (Map<String, Object>) geometry.get("location");
                
                Map<String, Object> output = new HashMap<>();
                output.put("place_id", placeId);
                output.put("address", result.get("formatted_address"));
                output.put("lat", new BigDecimal(location.get("lat").toString()));
                output.put("lng", new BigDecimal(location.get("lng").toString()));
                return output;
            }
        } catch (Exception e) {
            log.error("Place detail failed for placeId: {}", placeId, e);
        }
        return null;
    }

    /**
     * Distance Matrix API.
     */
    public List<Map<String, Object>> getDistanceMatrix(String origins, String destinations) {
        if (isMock()) {
            log.info("Goong API Key is mock. Using distance matrix simulation.");
            List<Map<String, Object>> list = new ArrayList<>();
            // Let's parse origins to see how many
            String[] originArray = origins.split("\\|");
            for (int i = 0; i < originArray.length; i++) {
                Map<String, Object> element = new HashMap<>();
                element.put("origin_index", i);
                
                // Simulate distance values: first is closer, second is farther
                double distanceVal = 1.2 + (i * 1.8); // km
                int durationVal = 300 + (i * 420); // seconds
                
                element.put("distance_value", distanceVal * 1000); // meters
                element.put("distance_text", String.format(Locale.US, "%.1f km", distanceVal));
                element.put("duration_value", durationVal);
                element.put("duration_text", String.format("%d min", durationVal / 60));
                list.add(element);
            }
            return list;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://rsapi.goong.io/DistanceMatrix")
                    .queryParam("origins", origins)
                    .queryParam("destinations", destinations)
                    .queryParam("vehicle", "car")
                    .queryParam("api_key", apiKey)
                    .build().toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> rows = (List<Map<String, Object>>) response.get("rows");
            if (rows != null && !rows.isEmpty()) {
                List<Map<String, Object>> list = new ArrayList<>();
                // Goong Distance Matrix returns a row for each origin containing elements for each destination
                for (int i = 0; i < rows.size(); i++) {
                    Map<String, Object> row = rows.get(i);
                    List<Map<String, Object>> elements = (List<Map<String, Object>>) row.get("elements");
                    if (elements != null && !elements.isEmpty()) {
                        Map<String, Object> element = elements.get(0); // single destination
                        String status = (String) element.get("status");
                        if ("OK".equalsIgnoreCase(status)) {
                            Map<String, Object> distance = (Map<String, Object>) element.get("distance");
                            Map<String, Object> duration = (Map<String, Object>) element.get("duration");
                            
                            Map<String, Object> opt = new HashMap<>();
                            opt.put("origin_index", i);
                            opt.put("distance_value", Double.parseDouble(distance.get("value").toString()));
                            opt.put("distance_text", distance.get("text"));
                            opt.put("duration_value", Integer.parseInt(duration.get("value").toString()));
                            opt.put("duration_text", duration.get("text"));
                            list.add(opt);
                        }
                    }
                }
                return list;
            }
        } catch (Exception e) {
            log.error("Distance matrix failed", e);
        }

        return Collections.emptyList();
    }
}
