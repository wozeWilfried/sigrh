package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import com.sigrh.cwa.enums.StatutPresence;

/**
 * Entité représentant une entrée de présence/absence d'un employé.
 * Enregistre l'assiduity, les retards et les absences.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "presences")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Presence {

    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Employé concerné */
    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges"})
    private Employe employe;

    /** Date de présence */
    private LocalDate date;

    /** Heure d'arrivée */
    private LocalTime heureArrivee;

    /** Heure de départ */
    private LocalTime heureDepart;

    /** Statut du jour */
    @Enumerated(EnumType.STRING)
    private StatutPresence statut; // PRESENT, ABSENT, RETARD, CONGE
}
