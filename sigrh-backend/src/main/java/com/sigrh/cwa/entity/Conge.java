package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import com.sigrh.cwa.enums.TypeConge;
import com.sigrh.cwa.enums.StatutConge;

/**
 * Entité représentant une demande de congés.
 * Gestion du cycle complet: demande, validation RH, approbation/refus.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "conges")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Conge {

    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Employé demandeur */
    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges"})
    private Employe employe;

    /** Type de congé */
    @Enumerated(EnumType.STRING)
    private TypeConge type; // ANNUEL, MALADIE, MATERNITE, SANS_SOLDE

    /** Date de début */
    private LocalDate dateDebut;

    /** Date de fin */
    private LocalDate dateFin;

    /** Nombre de jours de congé */
    private Integer nombreJours;

    /** Motif ou justification */
    private String motif;

    /** Statut de la demande */
    @Enumerated(EnumType.STRING)
    private StatutConge statut; // EN_ATTENTE, APPROUVE, REFUSE

    /** Commentaire du département RH */
    private String commentaireRH;

    /** Date de création de la demande */
    private LocalDate dateCreation;
}
