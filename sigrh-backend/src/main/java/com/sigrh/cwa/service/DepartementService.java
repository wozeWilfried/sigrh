package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.Departement;
import com.sigrh.cwa.repository.DepartementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion des départements.
 * Permet de:
 * - Créer et modifier les départements
 * - Consulter la liste des départements
 * - Supprimer des départements
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class DepartementService {

    private final DepartementRepository departementRepo;

    /**
     * Récupère tous les départements avec le nombre d'employés.
     * 
     * @return Liste de tous les départements
     */
    public List<Map<String, Object>> findAll() {
        return departementRepo.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    /**
     * Crée un nouveau département.
     * Vérifie qu'un département avec le même nom n'existe pas déjà.
     * 
     * @param data Données du département (nom, description, responsable)
     * @return Département créé avec identifiant assigné
     * @throws IllegalStateException Si le département existe déjà
     */
    @Transactional
    public Map<String, Object> create(Map<String, String> data) {
        if (departementRepo.existsByNom(data.get("nom")))
            throw new IllegalStateException("Département déjà existant");
        Departement d = Departement.builder()
            .nom(data.get("nom"))
            .description(data.get("description"))
            .responsable(data.get("responsable"))
            .build();
        return toMap(departementRepo.save(d));
    }

    /**
     * Modifie les informations d'un département existant.
     * 
     * @param id Identifiant du département
     * @param data Nouvelles données du département
     * @return Département modifié
     */
    public Map<String, Object> update(Long id, Map<String, String> data) {
        Departement d = departementRepo.findById(id).orElseThrow();
        d.setNom(data.get("nom"));
        d.setDescription(data.get("description"));
        d.setResponsable(data.get("responsable"));
        return toMap(departementRepo.save(d));
    }

    /**
     * Supprime un département.
     * 
     * @param id Identifiant du département à supprimer
     */
    public void delete(Long id) { 
        departementRepo.deleteById(id); 
    }

    private Map<String, Object> toMap(Departement d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("nom", d.getNom());
        m.put("description", d.getDescription());
        m.put("responsable", d.getResponsable());
        m.put("nombreEmployes", d.getEmployes() != null ? d.getEmployes().size() : 0);
        return m;
    }
}
