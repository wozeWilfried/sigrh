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

@Service
@RequiredArgsConstructor
public class MaterielService {

    private final MaterielRepository materielRepo;
    private final CategorieMaterielRepository categorieRepo;
    private final AttributionMaterielRepository attributionRepo;
    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;

    // ─── CATÉGORIES ─────────────────────────────────

    public List<Map<String, Object>> findAllCategories() {
        return categorieRepo.findAll().stream().map(this::categorieToMap).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createCategorie(Map<String, Object> data) {
        CategorieMateriel c = new CategorieMateriel();
        c.setNom((String) data.get("nom"));
        c.setDescription((String) data.get("description"));
        return categorieToMap(categorieRepo.save(c));
    }

    public Map<String, Object> findCategorieById(Long id) {
        return categorieToMap(categorieRepo.findById(id).orElseThrow());
    }

    @Transactional
    public Map<String, Object> updateCategorie(Long id, Map<String, Object> data) {
        CategorieMateriel c = categorieRepo.findById(id).orElseThrow();
        if (data.containsKey("nom")) c.setNom((String) data.get("nom"));
        if (data.containsKey("description")) c.setDescription((String) data.get("description"));
        return categorieToMap(categorieRepo.save(c));
    }

    @Transactional
    public void deleteCategorie(Long id) {
        CategorieMateriel c = categorieRepo.findById(id).orElseThrow();
        boolean aDuMateriel = materielRepo.findAll().stream()
            .anyMatch(m -> m.getCategorie() != null && m.getCategorie().getId().equals(id));
        if (aDuMateriel) {
            throw new IllegalStateException("Impossible de supprimer une catégorie qui contient du matériel");
        }
        categorieRepo.delete(c);
    }

    // ─── ÉQUIPEMENTS ─────────────────────────────────

    public List<Map<String, Object>> findAllMateriel(Long categorieId, String statut, Long employeId, String q) {
        return materielRepo.findAll().stream()
            .filter(m -> categorieId == null || (m.getCategorie() != null && m.getCategorie().getId().equals(categorieId)))
            .filter(m -> statut == null || m.getStatut().name().equalsIgnoreCase(statut))
            .filter(m -> employeId == null || (m.getEmploye() != null && m.getEmploye().getId().equals(employeId)))
            .filter(m -> q == null || m.getNom().toLowerCase().contains(q.toLowerCase())
                || m.getCode().toLowerCase().contains(q.toLowerCase())
                || m.getNumeroSerie().toLowerCase().contains(q.toLowerCase()))
            .map(this::materielToMap)
            .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createMateriel(Map<String, Object> data) {
        Materiel m = new Materiel();
        m.setCode((String) data.get("code"));
        m.setNom((String) data.get("nom"));
        m.setDescription((String) data.get("description"));
        m.setNumeroSerie((String) data.get("numeroSerie"));
        m.setStatut(StatutMateriel.DISPONIBLE);
        m.setQuantite(data.get("quantite") != null ? ((Number) data.get("quantite")).intValue() : 1);
        if (data.containsKey("dateAcquisition")) {
            m.setDateAcquisition(LocalDate.parse((String) data.get("dateAcquisition")));
        }
        if (data.containsKey("valeurAchat")) {
            m.setValeurAchat(((Number) data.get("valeurAchat")).doubleValue());
        }
        if (data.containsKey("categorieId")) {
            m.setCategorie(categorieRepo.findById(((Number) data.get("categorieId")).longValue()).orElse(null));
        }
        if (data.containsKey("departementId")) {
            m.setDepartement(deptRepo.findById(((Number) data.get("departementId")).longValue()).orElse(null));
        }
        return materielToMap(materielRepo.save(m));
    }

    @Transactional
    public Map<String, Object> updateMateriel(Long id, Map<String, Object> data) {
        Materiel m = materielRepo.findById(id).orElseThrow();
        if (data.containsKey("code")) m.setCode((String) data.get("code"));
        if (data.containsKey("nom")) m.setNom((String) data.get("nom"));
        if (data.containsKey("description")) m.setDescription((String) data.get("description"));
        if (data.containsKey("numeroSerie")) m.setNumeroSerie((String) data.get("numeroSerie"));
        if (data.containsKey("statut")) m.setStatut(StatutMateriel.valueOf((String) data.get("statut")));
        if (data.containsKey("quantite")) m.setQuantite(((Number) data.get("quantite")).intValue());
        if (data.containsKey("dateAcquisition")) m.setDateAcquisition(LocalDate.parse((String) data.get("dateAcquisition")));
        if (data.containsKey("valeurAchat")) m.setValeurAchat(((Number) data.get("valeurAchat")).doubleValue());
        if (data.containsKey("categorieId")) {
            m.setCategorie(categorieRepo.findById(((Number) data.get("categorieId")).longValue()).orElse(null));
        }
        if (data.containsKey("departementId")) {
            m.setDepartement(deptRepo.findById(((Number) data.get("departementId")).longValue()).orElse(null));
        }
        return materielToMap(materielRepo.save(m));
    }

    @Transactional
    public void deleteMateriel(Long id) {
        materielRepo.deleteById(id);
    }

    public Map<String, Object> getStats() {
        List<Materiel> all = materielRepo.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", all.size());
        stats.put("disponible", all.stream().filter(m -> m.getStatut() == StatutMateriel.DISPONIBLE).count());
        stats.put("assigne", all.stream().filter(m -> m.getStatut() == StatutMateriel.ASSIGNE).count());
        stats.put("enMaintenance", all.stream().filter(m -> m.getStatut() == StatutMateriel.EN_MAINTENANCE).count());
        stats.put("horsService", all.stream().filter(m -> m.getStatut() == StatutMateriel.HORS_SERVICE).count());
        stats.put("valeurTotale", all.stream().filter(m -> m.getValeurAchat() != null).mapToDouble(Materiel::getValeurAchat).sum());
        return stats;
    }

    // ─── ATTRIBUTIONS ───────────────────────────────

    public List<Map<String, Object>> findAllAttributions(Long materielId, Long employeId, Boolean retourne) {
        return attributionRepo.findAll().stream()
            .filter(a -> materielId == null || a.getMateriel().getId().equals(materielId))
            .filter(a -> employeId == null || a.getEmploye().getId().equals(employeId))
            .filter(a -> retourne == null || a.isRetourne() == retourne)
            .map(this::attributionToMap)
            .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> assignerMateriel(Map<String, Object> data) {
        Materiel m = materielRepo.findById(((Number) data.get("materielId")).longValue()).orElseThrow();
        Employe e = employeRepo.findById(((Number) data.get("employeId")).longValue()).orElseThrow();

        if (m.getStatut() == StatutMateriel.ASSIGNE) {
            throw new IllegalStateException("Ce matériel est déjà assigné");
        }
        if (m.getStatut() == StatutMateriel.HORS_SERVICE) {
            throw new IllegalStateException("Ce matériel est hors service");
        }

        m.setStatut(StatutMateriel.ASSIGNE);
        m.setEmploye(e);
        materielRepo.save(m);

        AttributionMateriel a = new AttributionMateriel();
        a.setMateriel(m);
        a.setEmploye(e);
        a.setDateAttribution(LocalDate.now());
        a.setMotif((String) data.get("motif"));
        a.setRetourne(false);
        return attributionToMap(attributionRepo.save(a));
    }

    @Transactional
    public Map<String, Object> retournerMateriel(Long id) {
        AttributionMateriel a = attributionRepo.findById(id).orElseThrow();
        a.setDateRetour(LocalDate.now());
        a.setRetourne(true);
        attributionRepo.save(a);

        Materiel m = a.getMateriel();
        m.setStatut(StatutMateriel.DISPONIBLE);
        m.setEmploye(null);
        materielRepo.save(m);

        return attributionToMap(a);
    }

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
