package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.AnalysePredictiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analyse")
@RequiredArgsConstructor
public class AnalysePredictiveController {

    private final AnalysePredictiveService analyseService;

    // Tableau de bord prédictif global

    // Analyse du turnover d'un employé

    // Analyse du turnover de tous les employés actifs

    // Absentéisme par département

    // Prévision de la masse salariale

    // Tendance des congés sur 12 mois

    // Liste des alertes

    // Marquer une alerte comme traitée

    // Générer toutes les alertes (déclenchement manuel)
    @PostMapping("/alertes/generer")
    public ResponseEntity<Map<String, Object>> genererAlertes() {
        return ResponseEntity.ok(analyseService.genererToutesLesAlertes());
    }
}
