package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.EmployeDTO;
import com.sigrh.cwa.service.EmployeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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
     * Récupère tous les employés avec filtres et pagination (accès filtré selon les permissions).
     * 
     * @param page       Numéro de page (défaut 0)
     * @param size       Taille de page (défaut 10)
     * @param search     Texte de recherche (nom, prénom, email, poste, matricule)
     * @param department Nom du département
     * @param position   Intitulé du poste
     * @param statut     Statut (ACTIF, INACTIF, SUSPENDU, EN_CONGE, DEPART)
     * @return Page d'employés avec métadonnées de pagination
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String statut) {
        return ResponseEntity.ok(employeService.findAll(page, size, search, department, position, statut));
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
    /**
     * Modifie le statut d'un employé.
     *
     * @param id Identifiant de l'employé
     * @param body Corps de la requête contenant le nouveau statut
     * @return EmployeDTO mis à jour
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statut = body.get("statut");
        return ResponseEntity.ok(employeService.updateStatus(id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
