package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.AnalysePredictiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alertes")
@RequiredArgsConstructor
public class AlerteRHController {

    private final AnalysePredictiveService analyseService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAlertes(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String statut
    ) {
        List<Map<String, Object>> alertes;
        if (statut == null || statut.isBlank()) {
            alertes = analyseService.getAlertes(false);
        } else if ("ACTIVE".equalsIgnoreCase(statut)) {
            alertes = analyseService.getAlertes(true);
        } else if ("TRAITEE".equalsIgnoreCase(statut)) {
            alertes = analyseService.getAlertesByTraitee(true);
        } else {
            alertes = analyseService.getAlertes(false);
        }

        if (type != null && !type.isBlank()) {
            alertes = alertes.stream()
                .filter(a -> type.equalsIgnoreCase((String) a.get("type")))
                .collect(Collectors.toList());
        }

        if (departement != null && !departement.isBlank()) {
            alertes = alertes.stream()
                .filter(a -> departement.equalsIgnoreCase((String) a.get("departement")))
                .collect(Collectors.toList());
        }

        return ResponseEntity.ok(alertes);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getAlertesCount(
            @RequestParam(defaultValue = "ACTIVE") String statut
    ) {
        long count = analyseService.countAlertesByStatut(statut);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/traiter")
    public ResponseEntity<Map<String, Object>> marquerTraitee(@PathVariable Long id) {
        return ResponseEntity.ok(analyseService.marquerAlerteTraitee(id));
    }

    @PutMapping("/traiter-tout")
    public ResponseEntity<Map<String, Object>> traiterTout() {
        return ResponseEntity.ok(analyseService.marquerToutesAlertesTraitees());
    }
}
