package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de recherche globale multi-critères.
 * Permet de:
 * - Rechercher dans tous les données de l'application
 * - Filtrer par type d'entité (employés, départements, congés, etc.)
 * - Paginer les résultats
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class SearchService {

    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;
    private final CongeRepository congeRepo;
    private final PresenceRepository presenceRepo;
    private final FichePaieRepository paieRepo;
    private final MaterielRepository materielRepo;

    public Map<String, Object> searchGlobal(String query, int page, int size, String type) {
        Map<String, Object> results = new LinkedHashMap<>();
        String q = query.toLowerCase();
        int total = 0;

        if (type == null || type.equals("employes")) {
            List<Map<String, Object>> list = searchEmployes(q);
            results.put("employes", applyPagination(list, page, size));
            total += list.size();
        }
        if (type == null || type.equals("departements")) {
            List<Map<String, Object>> list = searchDepartements(q);
            results.put("departements", applyPagination(list, page, size));
            total += list.size();
        }
        if (type == null || type.equals("conges")) {
            List<Map<String, Object>> list = searchConges(q);
            results.put("conges", applyPagination(list, page, size));
            total += list.size();
        }
        if (type == null || type.equals("presences")) {
            List<Map<String, Object>> list = searchPresences(q);
            results.put("presences", applyPagination(list, page, size));
            total += list.size();
        }
        if (type == null || type.equals("paie")) {
            List<Map<String, Object>> list = searchPaie(q);
            results.put("paie", applyPagination(list, page, size));
            total += list.size();
        }
        if (type == null || type.equals("materiel")) {
            List<Map<String, Object>> list = searchMateriel(q);
            results.put("materiel", applyPagination(list, page, size));
            total += list.size();
        }

        results.put("total", total);
        results.put("page", page);
        results.put("size", size);
        return results;
    }

    private <T> List<T> applyPagination(List<T> list, int page, int size) {
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, list.size());
        if (fromIndex >= list.size()) return Collections.emptyList();
        return list.subList(fromIndex, toIndex);
    }

    private List<Map<String, Object>> searchEmployes(String q) {
        return employeRepo.search(q).stream()
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", e.getId());
                m.put("nom", e.getNom() + " " + e.getPrenom());
                m.put("matricule", e.getMatricule());
                m.put("poste", e.getPoste());
                m.put("email", e.getEmail());
                m.put("statut", e.getStatut().name());
                m.put("departement", e.getDepartement() != null ? e.getDepartement().getNom() : null);
                m.put("type", "employe");
                return m;
            }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> searchDepartements(String q) {
        return deptRepo.findAll().stream()
            .filter(d -> d.getNom().toLowerCase().contains(q)
                || (d.getResponsable() != null && d.getResponsable().toLowerCase().contains(q)))
            .map(d -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", d.getId());
                m.put("nom", d.getNom());
                m.put("responsable", d.getResponsable());
                m.put("type", "departement");
                return m;
            }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> searchConges(String q) {
        return congeRepo.findAll().stream()
            .filter(c -> (c.getEmploye() != null
                && (c.getEmploye().getNom().toLowerCase().contains(q)
                    || c.getEmploye().getPrenom().toLowerCase().contains(q)))
                || (c.getType() != null && c.getType().name().toLowerCase().contains(q))
                || (c.getStatut() != null && c.getStatut().name().toLowerCase().contains(q)))
            .map(c -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", c.getId());
                m.put("employe", c.getEmploye() != null ? c.getEmploye().getNom() + " " + c.getEmploye().getPrenom() : null);
                m.put("type", c.getType().name());
                m.put("statut", c.getStatut().name());
                m.put("dateDebut", c.getDateDebut());
                m.put("dateFin", c.getDateFin());
                return m;
            }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> searchPresences(String q) {
        return presenceRepo.findAll().stream()
            .filter(p -> (p.getEmploye() != null
                && (p.getEmploye().getNom().toLowerCase().contains(q)
                    || p.getEmploye().getPrenom().toLowerCase().contains(q)))
                || (p.getStatut() != null && p.getStatut().name().toLowerCase().contains(q)))
            .map(p -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", p.getId());
                m.put("employe", p.getEmploye() != null ? p.getEmploye().getNom() + " " + p.getEmploye().getPrenom() : null);
                m.put("date", p.getDate());
                m.put("statut", p.getStatut().name());
                m.put("heureArrivee", p.getHeureArrivee());
                m.put("heureDepart", p.getHeureDepart());
                return m;
            }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> searchPaie(String q) {
        return paieRepo.findAll().stream()
            .filter(p -> p.getEmploye() != null
                && (p.getEmploye().getNom().toLowerCase().contains(q)
                    || p.getEmploye().getPrenom().toLowerCase().contains(q)))
            .map(p -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", p.getId());
                m.put("employe", p.getEmploye() != null ? p.getEmploye().getNom() + " " + p.getEmploye().getPrenom() : null);
                m.put("mois", p.getMois());
                m.put("annee", p.getAnnee());
                m.put("salaireBrut", p.getSalaireBrut());
                m.put("salaireNet", p.getSalaireNet());
                m.put("valide", p.isValide());
                return m;
            }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> searchMateriel(String q) {
        return materielRepo.findAll().stream()
            .filter(m -> m.getNom().toLowerCase().contains(q)
                || (m.getCode() != null && m.getCode().toLowerCase().contains(q))
                || (m.getNumeroSerie() != null && m.getNumeroSerie().toLowerCase().contains(q)))
            .map(m -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", m.getId());
                map.put("nom", m.getNom());
                map.put("code", m.getCode());
                map.put("categorie", m.getCategorie() != null ? m.getCategorie().getNom() : null);
                map.put("statut", m.getStatut().name());
                map.put("type", "materiel");
                return map;
            }).collect(Collectors.toList());
    }
}
