package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sigrh.cwa.enums.StatutMateriel;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "materiels")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Materiel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String code;

    @Column(nullable = false)
    private String nom;

    private String description;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    @JsonIgnoreProperties("materiels")
    private CategorieMateriel categorie;

    @Enumerated(EnumType.STRING)
    private StatutMateriel statut;

    private Integer quantite;
    private String numeroSerie;
    private LocalDate dateAcquisition;
    private Double valeurAchat;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges", "user", "departement"})
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "departement_id")
    @JsonIgnoreProperties("employes")
    private Departement departement;
}
