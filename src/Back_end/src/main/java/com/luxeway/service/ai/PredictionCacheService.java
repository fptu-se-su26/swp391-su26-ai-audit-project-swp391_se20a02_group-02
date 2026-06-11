package com.luxeway.service.ai;

import com.luxeway.dto.ai.AIPredictiveDashboardDTO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Maintains a thread-safe, in-memory cache of the latest {@link AIPredictiveDashboardDTO}.
 *
 * <ul>
 *   <li>On startup: triggers an async background warm-up via {@link #warmUp()} so the
 *       server does not block.</li>
 *   <li>Every 15 minutes: {@link #refresh()} rebuilds the cache via
 *       {@link AIPredictiveService#buildDashboard()}.</li>
 *   <li>{@link #getCached()} returns {@code null} while the first build is in progress
 *       (signals the controller to return HTTP 202).</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionCacheService {

    private final AIPredictiveService predictiveService;

    /** volatile for safe single-reader, single-writer visibility without blocking. */
    private volatile AIPredictiveDashboardDTO cachedDashboard = null;

    // ---------------------------------------------------------------- lifecycle

    /**
     * Schedules the initial cache warm-up without blocking Spring context startup.
     * Uses @Async to run in the background executor thread pool.
     */
    @PostConstruct
    public void init() {
        log.info("PredictionCacheService: scheduling initial warm-up");
        warmUp();
    }

    @Async("taskExecutor")
    public void warmUp() {
        log.info("PredictionCacheService: warm-up started");
        try {
            cachedDashboard = predictiveService.buildDashboard();
            log.info("PredictionCacheService: warm-up completed (sidecarWarning={})",
                    cachedDashboard.isSidecarWarning());
        } catch (Exception ex) {
            log.error("PredictionCacheService: warm-up failed: {}", ex.getMessage(), ex);
        }
    }

    // ---------------------------------------------------------------- scheduled refresh

    /** Refreshes the dashboard cache every 15 minutes (900_000 ms). */
    @Scheduled(fixedRate = 900_000)
    public void refresh() {
        log.info("PredictionCacheService: scheduled refresh triggered");
        try {
            cachedDashboard = predictiveService.buildDashboard();
            log.info("PredictionCacheService: refresh completed");
        } catch (Exception ex) {
            log.error("PredictionCacheService: refresh failed: {}", ex.getMessage(), ex);
        }
    }

    // ---------------------------------------------------------------- accessor

    /**
     * Returns the current cached dashboard, or {@code null} if the first build
     * has not yet completed (caller should return HTTP 202).
     */
    public AIPredictiveDashboardDTO getCached() {
        return cachedDashboard;
    }
}
