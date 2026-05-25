package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import com.sigrh.cwa.enums.StatutPresence;

@Entity
@Table(name = "presences")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Presence {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges"})
    private Employe employe;

    private LocalDate date;
    private LocalTime heureArrivee;
    private LocalTime heureDepart;

    @Enumerated(EnumType.STRING)
    private StatutPresence statut; // PRESENT, ABSENT, RETARD, CONGE
}
