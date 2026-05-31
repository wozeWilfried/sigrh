package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.service.EmployeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des employés.
 * Permet de créer, modifier, consulter et supprimer les employés.
 * La création d'un employé génère automatiquement un compte utilisateur
 * avec mot de passe temporaire envoyé par email.
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
     * Recherche des employés selon différents critères.
     * 
     * @param q Texte de recherche
     * @return Liste des employés correspondant au critère
     */
    @GetMapping("/search")
    public ResponseEntity<List<EmployeDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(employeService.search(q));
    }

    /**
     * Crée un nouvel employé avec son compte utilisateur.
     * Un mot de passe temporaire est généré et envoyé par email.
     * L'employé devra changer son mot de passe à la première connexion.
     * 
     * @param dto Données du nouvel employé
     * @return CreateEmployeResponse avec l'employé créé, le mot de passe temporaire et un message
     */
    @PostMapping
    public ResponseEntity<CreateEmployeResponse> create(@RequestBody EmployeDTO dto) {
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
