package com.luxeway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Path;

@Slf4j
@Service
public class FptAiOcrService {

    @Value("${fptai.api-key:BKfUiImFD4DI3RI2OEjoCahBTQOgVtPf}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OcrResult {
        private String licenseNumber;
        private String licenseClass;
        private String fullName;
        private String dateOfBirth;
        private String residence;
        private String nationality;
    }

    public OcrResult scanDrivingLicense(Path filePath) {
        log.info("Starting driving license OCR scan for file: {}", filePath);
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("api-key", apiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new FileSystemResource(filePath.toFile()));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            String url = "https://api.fpt.ai/vision/dlr/vnm";
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                log.error("FPT.AI OCR request failed with status code: {}", response.getStatusCode());
                throw new RuntimeException("FPT.AI OCR request failed with status: " + response.getStatusCode());
            }

            String responseBody = response.getBody();
            log.info("Received response from FPT.AI: {}", responseBody);

            JsonNode root = objectMapper.readTree(responseBody);
            
            // Check errorCode
            int errorCode = root.path("errorCode").asInt(-1);
            if (errorCode != 0) {
                String errorMessage = root.path("errorMessage").asText("Unknown error");
                log.error("FPT.AI OCR returned error code: {}, message: {}", errorCode, errorMessage);
                throw new RuntimeException("FPT.AI OCR error: " + errorMessage);
            }

            JsonNode dataNode = root.path("data");
            if (dataNode.isArray() && dataNode.size() > 0) {
                JsonNode firstItem = dataNode.get(0);
                
                String licenseNumber = firstText(firstItem, "id", "license_number", "licenseNumber", "number");
                String licenseClass = firstText(firstItem, "class", "license_class", "licenseClass", "type");
                String fullName = firstText(firstItem, "name", "full_name", "fullName", "fullname");
                String dateOfBirth = firstText(firstItem, "dob", "date_of_birth", "dateOfBirth", "birth_date", "birthday");
                String residence = firstText(firstItem, "address", "residence", "place_of_residence", "permanent_address", "address1");
                String nationality = firstText(firstItem, "nationality", "nation", "country");

                if (licenseClass != null) {
                    licenseClass = licenseClass.toUpperCase();
                }

                log.info("Extracted license number: {}, class: {}, name: {}, dob: {}, nationality: {}",
                        licenseNumber, licenseClass, fullName, dateOfBirth, nationality);
                
                if (licenseNumber == null && licenseClass == null) {
                    throw new RuntimeException("No valid driving license fields could be extracted.");
                }

                return new OcrResult(licenseNumber, licenseClass, fullName, dateOfBirth, residence, nationality);
            } else {
                throw new RuntimeException("FPT.AI response contains no data fields.");
            }

        } catch (Exception e) {
            log.error("Error performing driving license OCR scan", e);
            throw new RuntimeException("Driving license verification failed: " + e.getMessage(), e);
        }
    }

    private String firstText(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            if (!node.has(fieldName)) {
                continue;
            }

            JsonNode value = node.get(fieldName);
            String text = null;
            if (value.isArray() && value.size() > 0) {
                text = value.get(0).asText();
            } else if (!value.isNull()) {
                text = value.asText();
            }

            text = clean(text);
            if (text != null) {
                return text;
            }
        }
        return null;
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();
        if (cleaned.isEmpty() || "N/A".equalsIgnoreCase(cleaned) || "null".equalsIgnoreCase(cleaned)) {
            return null;
        }
        return cleaned;
    }
}
