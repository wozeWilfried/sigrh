package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.CongeDTO;
import com.sigrh.cwa.service.CongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des demandes de congés.
 * Permet de créer, valider et consulter les demandes de congés.
 * 
 * Point de terminaison: /api/conges
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/conges")
@RequiredArgsConstructor
public class CongeController {

    private final CongeService congeService;

    /**
     * Récupère les demandes de congés avec filtres optionnels.
     * 
     * @param employeId Filtre par employé (optionnel)
     * @param statut Filtre par statut: EN_ATTENTE, APPROUVE, REJETE (optionnel)
     * @return Liste des demandes de congés
     */
    @GetMapping
    public ResponseEntity<List<CongeDTO>> findAll(
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) String statut) {
        if (employeId != null) return ResponseEntity.ok(congeService.findByEmploye(employeId));
        if (statut != null)    return ResponseEntity.ok(congeService.findByStatut(statut));
        return ResponseEntity.ok(congeService.findAll());
    }

    /**
     * Crée une nouvelle demande de congés pour un employé.
     * 
     * @param dto Données de la demande (employeId, type, dateDebut, dateFin, motif)
     * @return Demande créée avec identifiant
     */
    @PostMapping
    public ResponseEntity<CongeDTO> create(@RequestBody CongeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(congeService.create(dto));
    }

    /**
     * Valide ou rejette une demande de congés (RH uniquement).
     * 
     * @param id Identifiant de la demande
     * @param body Contient statut (APPROUVE/REJETE) et commentaire
     * @return Demande avec le nouveau statut
     */
    @PutMapping("/{id}/valider")
    public ResponseEntity<CongeDTO> valider(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(congeService.valider(id, body.get("statut"), body.get("commentaire")));
    }

    /**
     * Supprime une demande de congés.
     * 
     * @param id Identifiant de la demande à supprimer
     * @return Pas de contenu en retour
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        congeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Calcule le solde de congés ANNUEL d'un employé.
     * 
     * @param employeId Identifiant de l'employé
     * @return soldeDisponible, joursAcquis, joursConsommes, joursEnAttente
     */
    @GetMapping("/solde/{employeId}")
    public ResponseEntity<Map<String, Object>> getSolde(@PathVariable Long employeId) {
        return ResponseEntity.ok(congeService.getSolde(employeId));
    }
}
