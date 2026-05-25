package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.EmployeDTO;
import com.sigrh.cwa.service.EmployeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Contrôleur REST pour la gestion des employés.
 * Permet de créer, modifier, consulter et supprimer les employés.
 * 
 * Point de terminaison: /api/employes
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/employes")
@RequiredArgsConstructor
public class EmployeController {

    private final EmployeService employeService;

    /**
     * Récupère tous les employés (accès filtré selon les permissions).
     * 
     * @return Liste de tous les employés
     */
    @GetMapping
    public ResponseEntity<List<EmployeDTO>> findAll() {
        return ResponseEntity.ok(employeService.findAll());
    }

    /**
     * Récupère les détails d'un employé spécifique.
     * 
     * @param id Identifiant de l'employé
     * @return DTO de l'employé
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(employeService.findById(id));
    }

    /**
     * Recherche des employés selon différents critéres.
     * 
     * @param q Texte de recherche
     * @return Liste des employés correspondant au critére
     */
    @GetMapping("/search")
    public ResponseEntity<List<EmployeDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(employeService.search(q));
    }

    /**
     * Crée un nouvel employé dans le système.
     * 
     * @param dto Données du nouvel employé
     * @return EmployeDTO avec l'identifiant assigné
     */
    @PostMapping
    public ResponseEntity<EmployeDTO> create(@RequestBody EmployeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeService.create(dto));
    }

    /**
     * Modifie les informations d'un employé existant.
     * 
     * @param id Identifiant de l'employé
     * @param dto Nouvelles données de l'employé
     * @return EmployeDTO mis à jour
     */
    @PutMapping("/{id}")
    public ResponseEntity<EmployeDTO> update(@PathVariable Long id, @RequestBody EmployeDTO dto) {
        return ResponseEntity.ok(employeService.update(id, dto));
    }

    /**
     * Supprime un employé du système.
     * 
     * @param id Identifiant de l'employé à supprimer
     * @return Pas de contenu en retour
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
