package com.luxeway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.Executor;

/**
 * Application-wide configuration beans.
 *
 * Provides:
 * <ul>
 *   <li>A named {@code RestTemplate} with timeout settings for the ML sidecar.</li>
 *   <li>An async {@link Executor} for {@link EnableAsync} tasks.</li>
 * </ul>
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AppConfig {

    @Value("${ml.service.timeout-ms:5000}")
    private int mlTimeoutMs;

    /**
     * Dedicated {@link RestTemplate} bean for the Python ML sidecar.
     * Uses a simple factory with explicit connect and read timeouts.
     * Named {@code mlRestTemplate} to avoid ambiguity with any other RestTemplate beans.
     */
    @Bean("mlRestTemplate")
    public RestTemplate mlRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(mlTimeoutMs);
        factory.setReadTimeout(mlTimeoutMs);
        return new RestTemplate(factory);
    }

    /**
     * Thread pool executor for @Async methods (cache warm-up, background refresh).
     */
    @Bean("taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("ai-async-");
        executor.initialize();
        return executor;
    }
}
