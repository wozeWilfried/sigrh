package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sigrh.cwa.enums.StatutContrat;
import com.sigrh.cwa.enums.TypeContrat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "contrats")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Contrat {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @ManyToOne
    @JoinColumn(name = "employe_id", nullable = false)
    @JsonIgnoreProperties("contrats")
    private Employe employe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeContrat type;

    @Column(nullable = false)
    private LocalDate dateDebut;

    private LocalDate dateFin;

    private Double salaire;

    private String poste;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutContrat statut;

    private LocalDate dateSignature;

    private String description;
}
