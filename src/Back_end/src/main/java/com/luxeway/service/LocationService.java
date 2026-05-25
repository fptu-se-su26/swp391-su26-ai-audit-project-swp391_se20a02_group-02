package com.luxeway.service;

import com.luxeway.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LocationService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<Map<String, Object>> getTopCities(int limit) {
        List<Object[]> results = vehicleRepository.findTopCities(PageRequest.of(0, limit));
        List<Map<String, Object>> topCities = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> cityData = new HashMap<>();
            String cityName = (String) row[0];
            Long vehicleCount = (Long) row[1];
            
            cityData.put("name", cityName);
            cityData.put("vehicles", vehicleCount);
            
            // Assign some default dynamic properties expected by frontend
            cityData.put("country", "Vietnam");
            // Set dynamic images based on city name or default
            String image = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop";
            if (cityName.toLowerCase().contains("ha noi")) image = "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop";
            else if (cityName.toLowerCase().contains("da nang")) image = "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop";
            else if (cityName.toLowerCase().contains("nha trang")) image = "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?q=80&w=800&auto=format&fit=crop";
            
            cityData.put("image", image);
            topCities.add(cityData);
        }
        
        return topCities;
    }
}
