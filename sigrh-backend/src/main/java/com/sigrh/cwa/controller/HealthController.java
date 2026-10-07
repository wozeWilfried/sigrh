package com.sigrh.cwa.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Endpoint public utilisé pour réveiller le backend (cold start Render)
 * et comme sonde de santé.
 *
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Indique que le service est démarré et répond.
     *
     * @return statut du service et horodatage courant
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "sigrh-backend");
        body.put("time", Instant.now().toString());
        return body;
    }
}