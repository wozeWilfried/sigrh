package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Contrôleur REST pour le tableau de bord SIGRH.
 * Fournit les statistiques et indicateurs RH globaux.
 * 
 * Point de terminaison: /api/dashboard
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Récupère le tableau de bord complet avec toutes les statistiques.
     * Inclut effectifs, départements, paie, congés, présences, alertes, etc.
     * 
     * @return Objet contenant tous les indicateurs RH
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}
