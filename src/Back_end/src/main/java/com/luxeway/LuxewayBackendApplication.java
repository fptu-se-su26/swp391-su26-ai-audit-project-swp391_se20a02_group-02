package com.luxeway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication

@EnableAsync
@EnableTransactionManagement
public class LuxewayBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LuxewayBackendApplication.class, args);
        System.out.println("🚗 LuxeWay Backend is running on http://localhost:8080/api/v1");
        System.out.println("📚 Swagger UI: http://localhost:8080/api/v1/swagger-ui.html");
        System.out.println("🔧 API Docs: http://localhost:8080/api/v1/api-docs");
    }
}