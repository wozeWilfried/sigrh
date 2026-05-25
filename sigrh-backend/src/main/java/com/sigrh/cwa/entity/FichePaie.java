package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "fiches_paie")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FichePaie {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges"})
    private Employe employe;

    private Integer mois;
    private Integer annee;

    private Double salaireBrut;
    private Double cotisationsCNPS;
    private Double impotIRPP;
    private Double autresRetenues;
    private Double primes;
    private Double salaireNet;

    private LocalDate dateGeneration;
    private boolean valide = false;
}
