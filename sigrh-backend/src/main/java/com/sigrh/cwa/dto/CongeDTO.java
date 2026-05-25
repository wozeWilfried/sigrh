package com.sigrh.cwa.dto;

import lombok.*;
import java.time.LocalDate;

/**
 * DTO pour transférer les données d'une demande de congés via l'API REST.
 * Utilisé pour la création, l'affichage et la validation des demandes de congés.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CongeDTO {
    /** Identifiant unique de la demande */
    private Long id;

    /** Identifiant de l'employé */
    private Long employeId;

    /** Nom complet de l'employé */
    private String employeNom;

    /** Type de congé (ANNUEL, MALADIE, MATERNITE, SANS_SOLDE) */
    private String type;

    /** Date de début des congés */
    private LocalDate dateDebut;

    /** Date de fin des congés */
    private LocalDate dateFin;

    /** Nombre de jours de congé */
    private Integer nombreJours;

    /** Motif ou justification */
    private String motif;

    /** Statut de la demande (EN_ATTENTE, APPROUVE, REFUSE) */
    private String statut;

    /** Commentaire du département RH */
    private String commentaireRH;
}
