package com.sigrh.cwa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.cors.*;
import java.util.Arrays;
import java.util.List;

/**
 * Configuration CORS (Cross-Origin Resource Sharing) pour l'application.
 * Permet les requêtes depuis les domaines autorisés.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Configure les paramètres CORS pour l'API.
     * Définit les origines autorisées, méthodes HTTP et en-têtes.
     * 
     * @return Configuration CORS
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
