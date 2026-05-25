package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.EmployeDTO;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.Genre;
import com.sigrh.cwa.enums.StatutEmploye;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des employés.
 * Permet de:
 * - Ajouter et modifier les données des employés
 * - Rechercher les employés
 * - Gérer les statuts (actif, inactif, suspendu)
 * - Filtrer l'accès selon les permissions
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;
    private final SecurityHelper security;

    /**
     * Récupère tous les employés (accès filtré selon le rôle de l'utilisateur).
     * 
     * @return Liste des employés
     */
    public List<EmployeDTO> findAll() {
        List<Employe> all = employeRepo.findAll();
        if (security.isAdminOrRh()) {
            return all.stream().map(this::toDTO).collect(Collectors.toList());
        }
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return all.stream()
                .filter(e -> e.getDepartement() != null && e.getDepartement().getId().equals(deptId))
                .map(this::toDTO).collect(Collectors.toList());
        }
        // Employé : accès limité à son propre profil
        return all.stream()
            .filter(e -> e.getId().equals(security.getCurrentEmployeId()))
            .map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Récupère un employé par son identifiant.
     * Vérifie les droits d'accès.
     * 
     * @param id Identifiant de l'employé
     * @return DTO de l'employé
     */
    public EmployeDTO findById(Long id) {
        Employe emp = employeRepo.findById(id).orElseThrow();
        if (!security.canAccessEmploye(id))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return toDTO(emp);
    }

    /**
     * Recherche des employés selon différents critéres (nom, email, téléphone).
     * Opération réservée aux administrateurs et RH.
     * 
     * @param query Texte de recherche
     * @return Liste des employés correspondant à la recherche
     */
    public List<EmployeDTO> search(String query) {
        if (!security.isAdminOrRh())
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return employeRepo.search(query).stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Crée un nouvel employé dans le système.
     * 
     * @param dto Données du nouvel employé
     * @return EmployeDTO avec l'identifiant assigné
     */
    @Transactional
    public EmployeDTO create(EmployeDTO dto) {
        Employe e = toEntity(dto);
        return toDTO(employeRepo.save(e));
    }

    /**
     * Modifie les informations d'un employé existant.
     * 
     * @param id Identifiant de l'employé
     * @param dto Nouvelles données de l'employé
     * @return EmployeDTO mis à jour
     */
    @Transactional
    public EmployeDTO update(Long id, EmployeDTO dto) {
        Employe existing = employeRepo.findById(id).orElseThrow();
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(dto.getEmail());
        existing.setTelephone(dto.getTelephone());
        existing.setPoste(dto.getPoste());
        existing.setSalaire(dto.getSalaire());
        existing.setStatut(StatutEmploye.valueOf(dto.getStatut()));
        if (dto.getDepartementId() != null) {
            existing.setDepartement(deptRepo.findById(dto.getDepartementId()).orElseThrow());
        }
        return toDTO(employeRepo.save(existing));
    }

    /**
     * Supprime un employé du système.
     * 
     * @param id Identifiant de l'employé à supprimer
     */
    @Transactional
    public void delete(Long id) { employeRepo.deleteById(id); }

    private EmployeDTO toDTO(Employe e) {
        return EmployeDTO.builder()
            .id(e.getId()).matricule(e.getMatricule())
            .nom(e.getNom()).prenom(e.getPrenom())
            .email(e.getEmail()).telephone(e.getTelephone())
            .genre(e.getGenre() != null ? e.getGenre().name() : null)
            .dateNaissance(e.getDateNaissance()).dateEmbauche(e.getDateEmbauche())
            .poste(e.getPoste()).salaire(e.getSalaire()).photoUrl(e.getPhotoUrl())
            .departementId(e.getDepartement() != null ? e.getDepartement().getId() : null)
            .departementNom(e.getDepartement() != null ? e.getDepartement().getNom() : null)
            .statut(e.getStatut() != null ? e.getStatut().name() : null)
            .build();
    }

    private Employe toEntity(EmployeDTO dto) {
        Employe e = new Employe();
        e.setMatricule(dto.getMatricule());
        e.setNom(dto.getNom()); e.setPrenom(dto.getPrenom());
        e.setEmail(dto.getEmail()); e.setTelephone(dto.getTelephone());
        if (dto.getGenre() != null) e.setGenre(Genre.valueOf(dto.getGenre()));
        e.setDateNaissance(dto.getDateNaissance());
        e.setDateEmbauche(dto.getDateEmbauche());
        e.setPoste(dto.getPoste()); e.setSalaire(dto.getSalaire());
        e.setStatut(StatutEmploye.ACTIF);
        if (dto.getDepartementId() != null) {
            e.setDepartement(deptRepo.findById(dto.getDepartementId()).orElseThrow());
        }
        return e;
    }
}
