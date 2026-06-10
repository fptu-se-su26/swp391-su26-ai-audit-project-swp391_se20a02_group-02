package com.luxeway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadUri = uploadPath.toUri().toString();

        registry.addResourceHandler("/uploads/**", "/api/v1/uploads/**")
                .addResourceLocations(uploadUri);
    }

    // @Override
    // public void configurePathMatch(org.springframework.web.servlet.config.annotation.PathMatchConfigurer configurer) {
    //     configurer.addPathPrefix("/api/v1", org.springframework.web.method.HandlerTypePredicate.forAnnotation(org.springframework.web.bind.annotation.RestController.class));
    // }
}
