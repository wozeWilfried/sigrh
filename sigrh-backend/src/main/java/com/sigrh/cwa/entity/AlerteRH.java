package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import com.sigrh.cwa.enums.TypeAlerte;
import com.sigrh.cwa.enums.NiveauAlerte;
import java.time.LocalDate;

/**
 * Entité représentant une alerte RH générée par le système prédictif.
 * Alerte sur des risques: turnover, abséntéisme, anomalies, etc.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "alertes_rh")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AlerteRH {

    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Employé concerné par l'alerte */
    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges", "user", "departement"})
    private Employe employe;

    /** Type d'alerte */
    @Enumerated(EnumType.STRING)
    private TypeAlerte type;

    /** Niveau de sévérité */
    @Enumerated(EnumType.STRING)
    private NiveauAlerte niveau;

    /** Message d'alerte */
    private String message;

    /** Score de risque (0.0 à 1.0) */
    private Double scoreRisque;

    /** Date de génération */
    private LocalDate dateAlerte;

    /** Indique si l'alerte a été traitée */
    private boolean traitee = false;
}
