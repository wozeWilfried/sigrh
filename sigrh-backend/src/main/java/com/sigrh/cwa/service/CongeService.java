package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.CongeDTO;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.StatutConge;
import com.sigrh.cwa.enums.StatutEmploye;
import com.sigrh.cwa.enums.TypeConge;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service de gestion des congés des employés.
 * Permet de:
 * - Créer et gérer les demandes de congés
 * - Valider/rejeter les congés (RH)
 * - Calculer le nombre de jours de congé
 * - Filtrer l'accès selon le rôle
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class CongeService {

    private final CongeRepository congeRepo;
    private final EmployeRepository employeRepo;
    private final SecurityHelper security;

    /**
     * Récupère tous les congés (accès filtré selon le rôle de l'utilisateur).
     * 
     * @return Liste des congés
     */
    public List<CongeDTO> findAll() {
        List<Conge> all = congeRepo.findAll();
        if (security.isAdminOrRh()) {
            return all.stream().map(this::toDTO).collect(Collectors.toList());
        }
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return all.stream()
                .filter(c -> c.getEmploye() != null && c.getEmploye().getDepartement() != null
                    && c.getEmploye().getDepartement().getId().equals(deptId))
                .map(this::toDTO).collect(Collectors.toList());
        }
        // Employé : accès limité à ses propres congés
        return all.stream()
            .filter(c -> c.getEmploye() != null && c.getEmploye().getId().equals(security.getCurrentEmployeId()))
            .map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Récupère tous les congés d'un employé spécifique.
     * 
     * @param employeId Identifiant de l'employé
     * @return Liste des congés de l'employé
     */
    public List<CongeDTO> findByEmploye(Long employeId) {
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return congeRepo.findByEmployeId(employeId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Récupère les congés filtrés par statut (Admin/RH uniquement).
     * 
     * @param statut Statut des congés à filtrer (EN_ATTENTE, APPROUVE, REJETE)
     * @return Liste des congés avec le statut spécifié
     */
    public List<CongeDTO> findByStatut(String statut) {
        List<Conge> all = congeRepo.findByStatut(StatutConge.valueOf(statut));
        if (security.isAdminOrRh()) {
            return all.stream().map(this::toDTO).collect(Collectors.toList());
        }
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return all.stream()
                .filter(c -> c.getEmploye() != null && c.getEmploye().getDepartement() != null
                    && c.getEmploye().getDepartement().getId().equals(deptId))
                .map(this::toDTO).collect(Collectors.toList());
        }
        throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
    }

    /**
     * Crée une nouvelle demande de congé.
     * Calcule automatiquement le nombre de jours entre dateDebut et dateFin.
     * 
     * @param dto Données de la demande de congé
     * @return Congé créé avec identifiant assigné
     */
    @Transactional
    public CongeDTO create(CongeDTO dto) {
        Employe employe = employeRepo.findById(dto.getEmployeId()).orElseThrow();
        if (!security.canAccessEmploye(dto.getEmployeId()))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        if (employe.getStatut() == StatutEmploye.DEPART)
            throw new IllegalArgumentException("Impossible de créer un congé pour un employé avec le statut DÉPART");
        long jours = ChronoUnit.DAYS.between(dto.getDateDebut(), dto.getDateFin()) + 1;

        Conge conge = Conge.builder()
            .employe(employe)
            .type(TypeConge.valueOf(dto.getType()))
            .dateDebut(dto.getDateDebut())
            .dateFin(dto.getDateFin())
            .nombreJours((int) jours)
            .motif(dto.getMotif())
            .statut(StatutConge.EN_ATTENTE)
            .dateCreation(LocalDate.now())
            .build();
        return toDTO(congeRepo.save(conge));
    }

    /**
     * Valide ou rejette une demande de congé (RH uniquement).
     * 
     * @param id Identifiant du congé
     * @param statut Nouveau statut (APPROUVE ou REJETE)
     * @param commentaire Commentaire de validation
     * @return Congé avec le nouveau statut
     */
    @Transactional
    public CongeDTO valider(Long id, String statut, String commentaire) {
        Conge conge = congeRepo.findById(id).orElseThrow();
        if (!security.isAdminOrRh()) {
            if (!security.isManager()) throw new AccessDeniedException("Accès refusé");
            Long deptId = conge.getEmploye() != null
                ? conge.getEmploye().getDepartement() != null ? conge.getEmploye().getDepartement().getId() : null
                : null;
            if (deptId == null || !deptId.equals(security.getCurrentDepartementId()))
                throw new AccessDeniedException("Accès refusé : cet employé n'est pas dans votre département");
        }
        conge.setStatut(StatutConge.valueOf(statut));
        conge.setCommentaireRH(commentaire);
        return toDTO(congeRepo.save(conge));
    }

    /**
     * Supprime une demande de congé.
     * Seul l'admin/RH ou l'employé qui a créé la demande peut la supprimer.
     * 
     * @param id Identifiant du congé à supprimer
     */
    @Transactional
    public void delete(Long id) {
        Conge conge = congeRepo.findById(id).orElseThrow();
        if (!security.isAdminOrRh()
            && !security.isSelf(conge.getEmploye() != null ? conge.getEmploye().getId() : null))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        congeRepo.deleteById(id);
    }

    /**
     * Calcule le solde de congés ANNUEL d'un employé.
     * 
     * Formule: 
     *   joursAcquis = ancienneté (années) × taux annuel (30 jours par défaut)
     *   joursConsommes = somme des congés APPROUVE de type ANNUEL
     *   joursEnAttente = somme des congés EN_ATTENTE de type ANNUEL
     *   soldeDisponible = joursAcquis - joursConsommes
     * 
     * @param employeId Identifiant de l'employé
     * @return Map contenant soldeDisponible, joursAcquis, joursConsommes, joursEnAttente
     */
    public Map<String, Object> getSolde(Long employeId) {
        Employe employe = employeRepo.findById(employeId).orElseThrow();
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");

        int tauxAnnuel = 30;

        int ancienneteAnnees = Period.between(employe.getDateEmbauche(), LocalDate.now()).getYears();
        int joursAcquis = Math.max(0, ancienneteAnnees * tauxAnnuel);

        int joursConsommes = congeRepo.findByEmployeIdAndTypeAndStatut(employeId, TypeConge.ANNUEL, StatutConge.APPROUVE)
            .stream()
            .mapToInt(c -> c.getNombreJours() != null ? c.getNombreJours() : 0)
            .sum();

        int joursEnAttente = congeRepo.findByEmployeIdAndTypeAndStatut(employeId, TypeConge.ANNUEL, StatutConge.EN_ATTENTE)
            .stream()
            .mapToInt(c -> c.getNombreJours() != null ? c.getNombreJours() : 0)
            .sum();

        int soldeDisponible = Math.max(0, joursAcquis - joursConsommes);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("employeId", employeId);
        result.put("soldeDisponible", soldeDisponible);
        result.put("joursAcquis", joursAcquis);
        result.put("joursConsommes", joursConsommes);
        result.put("joursEnAttente", joursEnAttente);
        return result;
    }

    /**
     * Convertit une entité Conge en DTO pour la sérialisation JSON.
     * 
     * @param c Entité Conge à convertir
     * @return DTO contenant les données du congé
     */
    private CongeDTO toDTO(Conge c) {
        return CongeDTO.builder()
            .id(c.getId())
            .employeId(c.getEmploye().getId())
            .employeNom(c.getEmploye().getNom() + " " + c.getEmploye().getPrenom())
            .type(c.getType().name())
            .dateDebut(c.getDateDebut())
            .dateFin(c.getDateFin())
            .nombreJours(c.getNombreJours())
            .motif(c.getMotif())
            .statut(c.getStatut().name())
            .commentaireRH(c.getCommentaireRH())
            .build();
    }
}
