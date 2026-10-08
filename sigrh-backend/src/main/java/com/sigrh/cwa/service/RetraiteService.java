package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.enums.StatutEmploye;
import com.sigrh.cwa.repository.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion des départs en retraite.
 *
 * L'âge légal de départ à la retraite est fixé à 60 ans. La date de retraite
 * théorique d'un employé est calculée à partir de sa date de naissance.
 * Les employés dont la date de retraite est dépassée portent le statut
 * {@link StatutEmploye#RETRAITE}.
 *
 * La liste des départs en retraite (réalisés et à venir) alimente l'analyse
 * prédictive du turnover : un départ en retraite est un départ certain.
 *
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class RetraiteService {

    /** Âge légal de départ à la retraite (années). */
    public static final int AGE_LEGAL_RETRAITE = 60;

    /** Horizon par défaut (en mois) des départs à venir affichés. */
    public static final int HORIZON_MOIS = 60;

    private final EmployeRepository employeRepo;

    /** Date de retraite théorique d'un employé (date de naissance + âge légal). */
    public static LocalDate dateRetraite(Employe e) {
        return e != null && e.getDateNaissance() != null
            ? e.getDateNaissance().plusYears(AGE_LEGAL_RETRAITE)
            : null;
    }

    /** Âge courant d'un employé (null si date de naissance inconnue). */
    public Integer age(Employe e) {
        if (e == null || e.getDateNaissance() == null) return null;
        return Period.between(e.getDateNaissance(), LocalDate.now()).getYears();
    }

    /**
     * Liste des départs en retraite : employés déjà partis (statut RETRAITE)
     * et employés encore en poste dont la retraite approche (horizon de 5 ans).
     */
    public List<Map<String, Object>> getDepartsRetraite() {
        return employeRepo.findAll().stream()
            .filter(e -> e.getDateNaissance() != null)
            .map(this::toEntry)
            .filter(Objects::nonNull)
            .sorted(Comparator
                .comparing((Map<String, Object> m) -> (Boolean) m.get("dejaParti")).reversed()
                .thenComparing(m -> (Long) m.get("moisRestants")))
            .collect(Collectors.toList());
    }

    private Map<String, Object> toEntry(Employe e) {
        LocalDate dateRetraite = dateRetraite(e);
        boolean dejaParti = e.getStatut() == StatutEmploye.RETRAITE;
        long moisRestants = ChronoUnit.MONTHS.between(LocalDate.now(), dateRetraite);

        if (!dejaParti) {
            boolean actifOuConge = e.getStatut() == StatutEmploye.ACTIF
                || e.getStatut() == StatutEmploye.EN_CONGE
                || e.getStatut() == null;
            if (!actifOuConge) return null;
            if (moisRestants > 60) return null;
        }

        int age = Period.between(e.getDateNaissance(), LocalDate.now()).getYears();

        String categorie;
        if (dejaParti || moisRestants <= 0) categorie = "RETRAITE";
        else if (moisRestants <= 12) categorie = "IMMINENT";
        else if (moisRestants <= 36) categorie = "PROCHE";
        else categorie = "PLANIFIE";

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("employeId",    e.getId());
        m.put("matricule",    e.getMatricule());
        m.put("nom",          e.getNom());
        m.put("prenom",       e.getPrenom());
        m.put("nomComplet",   e.getNom() + " " + e.getPrenom());
        m.put("poste",        e.getPoste());
        m.put("departement",  e.getDepartement() != null ? e.getDepartement().getNom() : "—");
        m.put("dateNaissance", e.getDateNaissance());
        m.put("age",          age);
        m.put("dateRetraite", dateRetraite);
        m.put("statut",       e.getStatut() != null ? e.getStatut().name() : null);
        m.put("dejaParti",    dejaParti || moisRestants <= 0);
        m.put("moisRestants", moisRestants);
        m.put("categorie",    categorie);
        return m;
    }
}