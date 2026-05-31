package com.sigrh.cwa.controller;

import com.sigrh.cwa.security.SecurityHelper;
import com.sigrh.cwa.service.MlPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
public class IaPredictionController {

    private final MlPredictionService mlService;
    private final SecurityHelper security;

    @GetMapping("/predictions")
    public ResponseEntity<List<Map<String, Object>>> getPredictions(
            @RequestParam(required = false) String niveau,
            @RequestParam(required = false) String departement) {

        List<Map<String, Object>> predictions = scopeForManager(mlService.predictAllTurnover());

        if (niveau != null && !niveau.isBlank()) {
            predictions = predictions.stream()
                    .filter(p -> niveau.equalsIgnoreCase((String) p.get("niveau")))
                    .collect(Collectors.toList());
        }

        if (departement != null && !departement.isBlank() && !security.isManager()) {
            predictions = predictions.stream()
                    .filter(p -> departement.equalsIgnoreCase((String) p.get("departement")))
                    .collect(Collectors.toList());
        }

        predictions.sort((a, b) -> {
            Double sa = a.get("scoreRisque") instanceof Number
                ? ((Number) a.get("scoreRisque")).doubleValue() : 0.0;
            Double sb = b.get("scoreRisque") instanceof Number
                ? ((Number) b.get("scoreRisque")).doubleValue() : 0.0;
            return sb.compareTo(sa);
        });

        return ResponseEntity.ok(predictions);
    }

    @PostMapping("/predict")
    public ResponseEntity<List<Map<String, Object>>> triggerPrediction() {
        List<Map<String, Object>> predictions = scopeForManager(mlService.predictAllTurnover());
        predictions.sort((a, b) -> {
            Double sa = a.get("scoreRisque") instanceof Number
                ? ((Number) a.get("scoreRisque")).doubleValue() : 0.0;
            Double sb = b.get("scoreRisque") instanceof Number
                ? ((Number) b.get("scoreRisque")).doubleValue() : 0.0;
            return sb.compareTo(sa);
        });
        return ResponseEntity.ok(predictions);
    }

    private List<Map<String, Object>> scopeForManager(List<Map<String, Object>> predictions) {
        if (!security.isManager()) return predictions;
        String deptName = security.getCurrentEmploye() != null
                && security.getCurrentEmploye().getDepartement() != null
            ? security.getCurrentEmploye().getDepartement().getNom()
            : null;
        if (deptName == null) return predictions;
        return predictions.stream()
                .filter(p -> deptName.equalsIgnoreCase((String) p.get("departement")))
                .collect(Collectors.toList());
    }

    @GetMapping("/employees/{id}/score")
    public ResponseEntity<Map<String, Object>> getEmployeeScore(@PathVariable Long id) {
        return ResponseEntity.ok(mlService.predictTurnover(id));
    }
}
