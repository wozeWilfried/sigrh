package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.DepartementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * Contrôleur REST pour la gestion des départements.
 * Permet de créer, modifier et consulter les structures organisationnelles.
 * 
 * Point de terminaison: /api/departements
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/departements")
@RequiredArgsConstructor
public class DepartementController {

    private final DepartementService deptService;

    /**
     * Récupère tous les départements avec statistiques.
     * 
     * @return Liste de tous les départements
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll() {
        return ResponseEntity.ok(deptService.findAll());
    }

    /**
     * Crée un nouveau département.
     * 
     * @param data Informations du département (nom, description, responsable)
     * @return Département créé avec identifiant
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, String> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deptService.create(data));
    }

    /**
     * Modifie les informations d'un département existant.
     * 
     * @param id Identifiant du département
     * @param data Nouvelles informations
     * @return Département mis à jour
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id, @RequestBody Map<String, String> data) {
        return ResponseEntity.ok(deptService.update(id, data));
    }

    /**
     * Supprime un département.
     * 
     * @param id Identifiant du département à supprimer
     * @return Pas de contenu en retour
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deptService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
