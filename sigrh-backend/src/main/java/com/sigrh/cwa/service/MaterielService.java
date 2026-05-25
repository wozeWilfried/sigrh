package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enums.StatutMateriel;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion du matériel et des équipements.
 * Permet de:
 * - Gérer les catégories de matériel
 * - Inventorier l'(équipement informatique et autres matériels
 * - Attribuer le matériel aux employés
 * - Suivre les retours et état du matériel
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class MaterielService {

    private final MaterielRepository materielRepo;
    private final CategorieMaterielRepository categorieRepo;
    private final AttributionMaterielRepository attributionRepo;
    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;

    // ─── CATÉGORIES ─────────────────────────────────

    // ─── ÉQUIPEMENTS ─────────────────────────────────

    // ─── ATTRIBUTIONS ───────────────────────────────

    // ─── STATISTIQUES ───────────────────────────────

    // ─── CONVERSION ─────────────────────────────────

    private Map<String, Object> categorieToMap(CategorieMateriel c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("nom", c.getNom());
        m.put("description", c.getDescription());
        return m;
    }

    private Map<String, Object> materielToMap(Materiel m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("code", m.getCode());
        map.put("nom", m.getNom());
        map.put("description", m.getDescription());
        map.put("categorie", m.getCategorie() != null ? m.getCategorie().getNom() : null);
        map.put("categorieId", m.getCategorie() != null ? m.getCategorie().getId() : null);
        map.put("statut", m.getStatut().name());
        map.put("quantite", m.getQuantite());
        map.put("numeroSerie", m.getNumeroSerie());
        map.put("dateAcquisition", m.getDateAcquisition());
        map.put("valeurAchat", m.getValeurAchat());
        map.put("employeId", m.getEmploye() != null ? m.getEmploye().getId() : null);
        map.put("employeNom", m.getEmploye() != null ? m.getEmploye().getNom() + " " + m.getEmploye().getPrenom() : null);
        map.put("departementId", m.getDepartement() != null ? m.getDepartement().getId() : null);
        map.put("departementNom", m.getDepartement() != null ? m.getDepartement().getNom() : null);
        return map;
    }

    private Map<String, Object> attributionToMap(AttributionMateriel a) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", a.getId());
        map.put("materielId", a.getMateriel().getId());
        map.put("materielNom", a.getMateriel().getNom());
        map.put("employeId", a.getEmploye().getId());
        map.put("employeNom", a.getEmploye().getNom() + " " + a.getEmploye().getPrenom());
        map.put("dateAttribution", a.getDateAttribution());
        map.put("dateRetour", a.getDateRetour());
        map.put("motif", a.getMotif());
        map.put("retourne", a.isRetourne());
        return map;
    }
}
