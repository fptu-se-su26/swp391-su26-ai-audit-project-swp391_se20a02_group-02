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

        // BUG-09 FIX: With context-path /api/v1, Spring MVC receives paths AFTER the prefix is stripped.
        // Register only /uploads/** — the context-path is already handled by Tomcat.
        // The /api/v1/uploads/** variant would create a double-prefix path.
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUri);
    }

    // BUG-01 FIX: REMOVED configurePathMatch override.
    // application.yml already sets server.servlet.context-path=/api/v1, which makes Tomcat
    // strip the /api/v1 prefix before handing the request to Spring MVC.
    // The old addPathPrefix("/api/v1", ...) caused ALL controller routes to be registered at
    // /api/v1/... from Spring MVC's perspective, but requests arrived at / (already stripped),
    // so zero routes were matched and every endpoint returned 404.
}
