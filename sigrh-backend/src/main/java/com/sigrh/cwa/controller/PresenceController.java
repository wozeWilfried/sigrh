package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

/**
 * Contrôleur REST pour la gestion des présences des employés.
 * Permet d'enregistrer et consulter les présences/absences.
 * 
 * Point de terminaison: /api/presences
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/presences")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    /**
     * Récupère toutes les présences ou les présences d'une date spécifique.
     * 
     * @param date Date optionnelle pour filtrer les présences
     * @return Liste des présences au format JSON
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(presenceService.findAll(date));
    }

    /**
     * Récupère les présences d'un employé sur une période donnée.
     * 
     * @param id Identifiant de l'employé
     * @param debut Date de début de la période
     * @param fin Date de fin de la période
     * @return Liste des présences pour la période
     */
    @GetMapping("/employe/{id}")
    public ResponseEntity<List<Map<String, Object>>> findByEmploye(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(presenceService.findByEmploye(id, debut, fin));
    }

    @GetMapping("/historique")
    public ResponseEntity<Map<String, Object>> getHistory(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(presenceService.getAttendanceHistory(parseLong(employeeId), department, startDate, endDate));
    }

    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(presenceService.getAttendanceStatistics(parseLong(employeeId), department, startDate, endDate));
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /**
     * Enregistre un pointage (présence, absence, retard).
     * 
     * @param data Données du pointage (employeId, date, statut, heures)
     * @return Pointage enregistré
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> pointer(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presenceService.pointer(data));
    }

    /**
     * Génère un rapport mensuel de présence pour un employé.
     * 
     * @param employeId Identifiant de l'employé
     * @param mois Mois à analyser (1-12)
     * @param annee Année à analyser
     * @return Rapport contenant résumé et détails des présences
     */
    @GetMapping("/rapport/{employeId}")
    public ResponseEntity<Map<String, Object>> rapport(
            @PathVariable Long employeId,
            @RequestParam int mois,
            @RequestParam int annee) {
        return ResponseEntity.ok(presenceService.getRapportMensuel(employeId, mois, annee));
    }
}
