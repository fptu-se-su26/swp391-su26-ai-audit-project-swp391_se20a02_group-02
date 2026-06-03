package com.luxeway.config;

import com.luxeway.repository.UserRepository;
import com.luxeway.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserRepository userRepository;
    private final com.luxeway.security.OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            UserRepository userRepository,
            @org.springframework.context.annotation.Lazy com.luxeway.security.OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userRepository = userRepository;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(401);
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication is required to access this resource\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(403);
                    response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"Access denied: insufficient privileges\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // ======== Public endpoints ========
                // BUG-11 FIX: Controllers map to /auth/**, /vehicles/**, etc. (no /api/v1/ prefix).
                // Keeping /api/v1/** variants for forward compatibility, but also adding unprefixed paths.
                .requestMatchers(
                    // Auth flows
                    "/auth/**",
                    "/api/v1/auth/**",
                    // OAuth2
                    "/oauth2/**",
                    "/login/oauth2/**",
                    // Swagger / OpenAPI docs
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/api-docs/**",
                    "/v3/api-docs/**",
                    // Actuator
                    "/actuator/**",
                    // VNPay callbacks (must be public since VNPay server calls them)
                    "/payments/vnpay/callback",
                    "/payments/vnpay/return",
                    "/api/v1/payments/vnpay/callback",
                    "/api/v1/payments/vnpay/return",
                    // Static uploads
                    "/uploads/**",
                    // Public pages
                    "/stats/**",
                    "/stats",
                    "/api/v1/stats/**",
                    "/api/v1/stats",
                    "/home/**",
                    "/api/v1/home/**",
                    "/locations/**",
                    "/api/v1/locations/**",
                    "/faqs/**",
                    "/faqs",
                    "/api/v1/faqs/**",
                    "/api/v1/faqs",
                    // Help Center Knowledge Base (public — no auth needed)
                    "/help/**",
                    "/api/v1/help/**",
                    "/error"
                ).permitAll()
                // Support ticket endpoints — must be authenticated
                .requestMatchers("/support/**", "/api/v1/support/**").authenticated()
                // Public vehicle browsing (no auth needed)
                .requestMatchers(HttpMethod.GET,
                    "/vehicles",
                    "/vehicles/search",
                    "/vehicles/featured",
                    "/vehicles/{id}",
                    "/api/v1/vehicles",
                    "/api/v1/vehicles/search",
                    "/api/v1/vehicles/featured",
                    "/api/v1/vehicles/{id}",
                    "/reviews/vehicle/**",
                    "/reviews/featured",
                    "/api/v1/reviews/vehicle/**",
                    "/api/v1/reviews/featured"
                ).permitAll()
                // ======== Admin only ========
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/test/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/users", "/api/v1/users").hasRole("ADMIN")
                // ======== Owner or Admin ========
                .requestMatchers(HttpMethod.POST,
                    "/vehicles", "/api/v1/vehicles"
                ).hasAnyRole("OWNER", "ADMIN")
                .requestMatchers(HttpMethod.PUT,
                    "/vehicles/**", "/api/v1/vehicles/**"
                ).hasAnyRole("OWNER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE,
                    "/vehicles/**", "/api/v1/vehicles/**"
                ).hasAnyRole("OWNER", "ADMIN")
                // Upload endpoint requires authentication
                .requestMatchers(HttpMethod.POST, "/upload", "/upload/**", "/users/documents", "/api/v1/users/documents").authenticated()
                // All other requests must be authenticated
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        // Standard Spring Security checks: isAccountNonLocked, isEnabled, etc.
        // Users are auto-verified on registration (dev mode), so isEnabled() = true.
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

