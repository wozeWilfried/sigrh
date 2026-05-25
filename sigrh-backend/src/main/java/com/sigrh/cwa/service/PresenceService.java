package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.StatutPresence;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion des présences des employés.
 * Permet de:
 * - Enregistrer les présences/absences des employés
 * - Générer des rapports mensuels de présence
 * - Filtrer l'accès selon le rôle de l'utilisateur (Admin, RH, Manager, Employé)
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

    private final PresenceRepository presenceRepo;
    private final EmployeRepository employeRepo;
    private final SecurityHelper security;

    /**
     * Récupère toutes les présences (optionnellement filtrées par date).
     * L'accès est restreint selon le rôle de l'utilisateur.
     * 
     * @param date Date de présence à filtrer (optionnelle)
     * @return Liste des présences au format Map
     */
    public List<Map<String, Object>> findAll(LocalDate date) {
        List<Presence> list = date != null
            ? presenceRepo.findByDate(date)
            : presenceRepo.findAll();
        if (security.isAdminOrRh()) {
            return list.stream().map(this::toMap).collect(Collectors.toList());
        }
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return list.stream()
                .filter(p -> p.getEmploye() != null && p.getEmploye().getDepartement() != null
                    && p.getEmploye().getDepartement().getId().equals(deptId))
                .map(this::toMap).collect(Collectors.toList());
        }
        // Employé : accès limité à ses propres présences
        return list.stream()
            .filter(p -> p.getEmploye() != null && p.getEmploye().getId().equals(security.getCurrentEmployeId()))
            .map(this::toMap).collect(Collectors.toList());
    }

    /**
     * Récupère les présences d'un employé sur une période donnée.
     * 
     * @param employeId Identifiant de l'employé
     * @param debut Date de début de la période
     * @param fin Date de fin de la période
     * @return Liste des présences de la période
     */
    public List<Map<String, Object>> findByEmploye(Long employeId, LocalDate debut, LocalDate fin) {
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return presenceRepo.findByEmployeIdAndDateBetween(employeId, debut, fin)
            .stream().map(this::toMap).collect(Collectors.toList());
    }

    /**
     * Enregistre un pointage de présence/absence pour un employé.
     * 
     * @param data Données contenant: employeId, date, statut, heureArrivee, heureDepart
     * @return Données de la présence enregistrée
     */
    @Transactional
    public Map<String, Object> pointer(Map<String, Object> data) {
        Long employeId = Long.valueOf(data.get("employeId").toString());
        Employe employe = employeRepo.findById(employeId).orElseThrow();
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");

        Presence p = Presence.builder()
            .employe(employe)
            .date(LocalDate.parse(data.get("date").toString()))
            .statut(StatutPresence.valueOf(data.get("statut").toString()))
            .build();

        if (data.get("heureArrivee") != null)
            p.setHeureArrivee(java.time.LocalTime.parse(data.get("heureArrivee").toString()));
        if (data.get("heureDepart") != null)
            p.setHeureDepart(java.time.LocalTime.parse(data.get("heureDepart").toString()));

        return toMap(presenceRepo.save(p));
    }

    /**
     * Génère un rapport mensuel de présence/absence pour un employé.
     * Inclut le résumé et les détails des présences du mois.
     * 
     * @param employeId Identifiant de l'employé
     * @param mois Mois à analyser (1-12)
     * @param annee Année à analyser
     * @return Rapport contenant présents, absents, retards et congés
     */
    public Map<String, Object> getRapportMensuel(Long employeId, int mois, int annee) {
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        LocalDate debut = LocalDate.of(annee, mois, 1);
        LocalDate fin   = debut.withDayOfMonth(debut.lengthOfMonth());
        List<Presence> list = presenceRepo.findByEmployeIdAndDateBetween(employeId, debut, fin);

        Map<String, Object> rapport = new HashMap<>();
        rapport.put("employeId", employeId);
        rapport.put("totalJours", list.size());
        rapport.put("presents",   list.stream().filter(p -> p.getStatut() == StatutPresence.PRESENT).count());
        rapport.put("absents",    list.stream().filter(p -> p.getStatut() == StatutPresence.ABSENT).count());
        rapport.put("retards",    list.stream().filter(p -> p.getStatut() == StatutPresence.RETARD).count());
        rapport.put("conges",     list.stream().filter(p -> p.getStatut() == StatutPresence.CONGE).count());
        rapport.put("details",    list.stream().map(this::toMap).collect(Collectors.toList()));
        return rapport;
    }

    /**
     * Convertit une entité Presence en Map pour la sérialisation JSON.
     * 
     * @param p Entité Presence à convertir
     * @return Map contenant les données de la présence
     */
    private Map<String, Object> toMap(Presence p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("employeId", p.getEmploye().getId());
        m.put("employeNom", p.getEmploye().getNom() + " " + p.getEmploye().getPrenom());
        m.put("date", p.getDate());
        m.put("heureArrivee", p.getHeureArrivee());
        m.put("heureDepart", p.getHeureDepart());
        m.put("statut", p.getStatut().name());
        return m;
    }
}
