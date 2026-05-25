package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.AnalysePredictiveService;
import com.sigrh.cwa.service.MlPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analyse")
@RequiredArgsConstructor
public class AnalysePredictiveController {

    private final AnalysePredictiveService analyseService;
    private final MlPredictionService mlService;

    // Tableau de bord prédictif global
    @GetMapping("/dashboard-predictif")
    public ResponseEntity<Map<String, Object>> getDashboardPredictif() {
        return ResponseEntity.ok(analyseService.getDashboardPredictif());
    }

    // Analyse du turnover d'un employé (ML avec fallback)
    @GetMapping("/turnover/{employeId}")
    public ResponseEntity<Map<String, Object>> getTurnover(@PathVariable Long employeId) {
        return ResponseEntity.ok(mlService.predictTurnover(employeId));
    }

    // Analyse du turnover de tous les employés actifs (ML batch)
    @GetMapping("/turnover")
    public ResponseEntity<List<Map<String, Object>>> getTurnoverGlobal() {
        return ResponseEntity.ok(mlService.predictAllTurnover());
    }

    // Absentéisme par département
    @GetMapping("/absenteisme")
    public ResponseEntity<List<Map<String, Object>>> getAbsenteisme() {
        return ResponseEntity.ok(analyseService.analyserAbsenteismeParDepartement());
    }

    // Prévision de la masse salariale
    @GetMapping("/prevision-masse-salariale")
    public ResponseEntity<Map<String, Object>> getPrevisionMasseSalariale() {
        return ResponseEntity.ok(analyseService.previsionMasseSalariale());
    }

    // Tendance des congés sur 12 mois
    @GetMapping("/tendance-conges")
    public ResponseEntity<List<Map<String, Object>>> getTendanceConges() {
        return ResponseEntity.ok(analyseService.getTendanceConges());
    }

    // Liste des alertes
    @GetMapping("/alertes")
    public ResponseEntity<List<Map<String, Object>>> getAlertes(
            @RequestParam(defaultValue = "true") boolean nonTraitees) {
        return ResponseEntity.ok(analyseService.getAlertes(nonTraitees));
    }

    // Marquer une alerte comme traitée
    @PutMapping("/alertes/{id}/traiter")
    public ResponseEntity<Map<String, Object>> marquerTraitee(@PathVariable Long id) {
        return ResponseEntity.ok(analyseService.marquerAlerteTraitee(id));
    }

    // Générer toutes les alertes (déclenchement manuel)
    @PostMapping("/alertes/generer")
    public ResponseEntity<Map<String, Object>> genererAlertes() {
        return ResponseEntity.ok(analyseService.genererToutesLesAlertes());
    }

    // ─── Endpoints ML spécifiques ─────────────────────

    @GetMapping("/ml/status")
    public ResponseEntity<Map<String, Object>> getMlStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("disponible", mlService.isMlServiceAvailable());
        status.put("mode", mlService.isMlServiceAvailable() ? "XGBoost" : "Heuristique (fallback)");
        status.put("modelInfo", mlService.getModelInfo());
        return ResponseEntity.ok(status);
    }

    @PostMapping("/ml/train")
    public ResponseEntity<Map<String, Object>> trainMlModel(
            @RequestParam(defaultValue = "2000") int echantillons) {
        return ResponseEntity.ok(mlService.trainModel(echantillons));
    }
}
