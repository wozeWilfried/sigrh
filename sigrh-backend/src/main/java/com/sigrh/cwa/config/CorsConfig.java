package com.sigrh.cwa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.cors.*;
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
     * Accepte les origines explicites fournies en configuration ainsi que
     * tous les déploiements Vercel (preview/production) et le dev local,
     * afin que l'application fonctionne depuis n'importe quel lien partagé.
     *
     * @return Configuration CORS
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> patterns = new java.util.ArrayList<>();
        for (String origin : allowedOrigins.split(",")) {
            String trimmed = origin.trim();
            if (!trimmed.isBlank()) patterns.add(trimmed);
        }
        // Tous les domaines Vercel (prod + previews) et les origines locales de dev
        patterns.add("https://*.vercel.app");
        patterns.add("http://localhost:*");
        patterns.add("http://127.0.0.1:*");
        config.setAllowedOriginPatterns(patterns);
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
