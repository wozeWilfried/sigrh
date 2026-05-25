package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getDashboardKpis() {
        return ResponseEntity.ok(dashboardService.getDashboardKpis());
    }

    @GetMapping("/attendance-stats")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceStats() {
        return ResponseEntity.ok(dashboardService.getAttendanceStats());
    }

    @GetMapping("/department-distribution")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentDistribution() {
        return ResponseEntity.ok(dashboardService.getDepartmentDistribution());
    }

    @GetMapping("/risk-trends")
    public ResponseEntity<List<Map<String, Object>>> getRiskTrends() {
        return ResponseEntity.ok(dashboardService.getRiskTrends());
    }

    @GetMapping("/recent-leaves")
    public ResponseEntity<List<Map<String, Object>>> getRecentLeaves() {
        return ResponseEntity.ok(dashboardService.getRecentLeaves());
    }

    @GetMapping("/recent-alerts")
    public ResponseEntity<List<Map<String, Object>>> getRecentAlerts() {
        return ResponseEntity.ok(dashboardService.getRecentAlerts());
    }
}
