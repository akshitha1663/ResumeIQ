package com.resumeiq.backend.config;

/**
 * CORS is handled centrally by SecurityConfig.corsConfigurationSource().
 * This class is intentionally left empty to avoid conflicting with the
 * CorsConfigurationSource bean defined in SecurityConfig, which covers
 * all allowed origins (read from cors.allowed-origins in application.properties).
 */
public class CorsConfig {
    // Intentionally empty — see SecurityConfig.corsConfigurationSource()
}