package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.FichePaieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * Contrôleur REST pour la gestion de la paie et des fiches de salaire.
 * Permet de générer, consulter et valider les fiches de paie.
 * 
 * Point de terminaison: /api/paie
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/paie")
@RequiredArgsConstructor
public class FichePaieController {

    private final FichePaieService paieService;

    /**
     * Récupère les fiches de paie avec filtre optionnel par employé.
     * 
     * @param employeId Filtre par employé (optionnel)
     * @return Liste des fiches de paie
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll(
            @RequestParam(required = false) Long employeId) {
        if (employeId != null) return ResponseEntity.ok(paieService.findByEmployeId(employeId));
        return ResponseEntity.ok(paieService.findAll());
    }

    /**
     * Génère une nouvelle fiche de paie pour un employé.
     * 
     * @param body Données: employeId, mois, année
     * @return Fiche de paie générée
     */
    @PostMapping("/generer")
    public ResponseEntity<Map<String, Object>> generer(@RequestBody Map<String, Object> body) {
        Long employeId = Long.valueOf(body.get("employeId").toString());
        int mois  = Integer.parseInt(body.get("mois").toString());
        int annee = Integer.parseInt(body.get("annee").toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(paieService.generer(employeId, mois, annee));
    }

    /**
     * Valide une fiche de paie avant distribution.
     * 
     * @param id Identifiant de la fiche de paie
     * @return Fiche de paie validée
     */
    @PutMapping("/{id}/valider")
    public ResponseEntity<Map<String, Object>> valider(@PathVariable Long id) {
        return ResponseEntity.ok(paieService.valider(id));
    }
}
