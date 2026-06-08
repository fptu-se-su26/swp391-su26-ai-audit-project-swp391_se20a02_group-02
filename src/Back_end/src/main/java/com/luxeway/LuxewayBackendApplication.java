package com.luxeway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication

@EnableAsync
@EnableTransactionManagement
public class LuxewayBackendApplication {

    static {
        java.io.File envFile = new java.io.File(".env");
        if (!envFile.exists()) {
            envFile = new java.io.File("../.env");
        }
        if (!envFile.exists()) {
            envFile = new java.io.File("../../.env");
        }
        if (envFile.exists()) {
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
                System.out.println("Loaded environment variables from: " + envFile.getAbsolutePath());
            } catch (java.io.IOException e) {
                System.err.println("Error reading .env file: " + e.getMessage());
            }
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(LuxewayBackendApplication.class, args);
        System.out.println("🚗 LuxeWay Backend is running on http://localhost:8080/api/v1");
        System.out.println("📚 Swagger UI: http://localhost:8080/api/v1/swagger-ui.html");
        System.out.println("🔧 API Docs: http://localhost:8080/api/v1/api-docs");
    }
}