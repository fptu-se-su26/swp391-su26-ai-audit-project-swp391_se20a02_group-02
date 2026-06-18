package com.luxeway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@SuppressWarnings("all")
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        // On Windows, Path.toString() uses backslashes.
        // Spring ResourceHandlerRegistry requires forward slashes in the file: URI.
        // We replace backslashes and use triple-slash for absolute Windows paths.
        String pathStr = uploadPath.toString().replace('\\', '/');
        // Ensure triple slash for absolute path: file:///C:/path/to/uploads/
        String uploadUri = (pathStr.startsWith("/") ? "file://" : "file:///") + pathStr + "/";

        registry.addResourceHandler("/uploads/**", "/api/v1/uploads/**")
                .addResourceLocations(uploadUri);
    }

    @Override
    public void configurePathMatch(org.springframework.web.servlet.config.annotation.PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api/v1", org.springframework.web.method.HandlerTypePredicate.forAnnotation(org.springframework.web.bind.annotation.RestController.class));
    }
}
