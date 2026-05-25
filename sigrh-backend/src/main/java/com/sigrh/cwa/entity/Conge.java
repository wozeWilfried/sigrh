package com.sigrh.cwa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import com.sigrh.cwa.enums.TypeConge;
import com.sigrh.cwa.enums.StatutConge;

@Entity
@Table(name = "conges")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Conge {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @Enumerated(EnumType.STRING)
    private TypeConge type; // ANNUEL, MALADIE, MATERNITE, SANS_SOLDE

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer nombreJours;
    private String motif;

    @Enumerated(EnumType.STRING)
    private StatutConge statut; // EN_ATTENTE, APPROUVE, REFUSE

    private String commentaireRH;
    private LocalDate dateCreation;
}
