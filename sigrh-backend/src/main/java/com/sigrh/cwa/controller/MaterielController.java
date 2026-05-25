package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.MaterielService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/materiel")
@RequiredArgsConstructor
public class MaterielController {

    private final MaterielService materielService;

    // ─── CATÉGORIES ─────────────────────────────────

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> findAllCategories() {
        return ResponseEntity.ok(materielService.findAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Map<String, Object>> createCategorie(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materielService.createCategorie(data));
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<Map<String, Object>> findCategorieById(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.findCategorieById(id));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Map<String, Object>> updateCategorie(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(materielService.updateCategorie(id, data));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategorie(@PathVariable Long id) {
        materielService.deleteCategorie(id);
        return ResponseEntity.ok(Map.of("message", "Catégorie supprimée"));
    }

    // ─── ÉQUIPEMENTS ─────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAllMateriel(
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(materielService.findAllMateriel(categorieId, statut, employeId, q));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createMateriel(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materielService.createMateriel(data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateMateriel(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(materielService.updateMateriel(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMateriel(@PathVariable Long id) {
        materielService.deleteMateriel(id);
        return ResponseEntity.ok(Map.of("message", "Équipement supprimé"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(materielService.getStats());
    }

    // ─── ATTRIBUTIONS ───────────────────────────────

    @GetMapping("/attributions")
    public ResponseEntity<List<Map<String, Object>>> findAllAttributions(
            @RequestParam(required = false) Long materielId,
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) Boolean retourne) {
        return ResponseEntity.ok(materielService.findAllAttributions(materielId, employeId, retourne));
    }

    @PostMapping("/attributions")
    public ResponseEntity<Map<String, Object>> assignerMateriel(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materielService.assignerMateriel(data));
    }

    @PutMapping("/attributions/{id}/retour")
    public ResponseEntity<Map<String, Object>> retournerMateriel(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.retournerMateriel(id));
    }
}
