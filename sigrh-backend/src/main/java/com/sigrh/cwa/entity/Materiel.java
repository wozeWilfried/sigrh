package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sigrh.cwa.enums.StatutMateriel;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Entité représentant un équipement ou du matériel dans l'inventaire.
 * Suivage de l'allocation, la maintenance et la valeur.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "materiels")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Materiel {
    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Code unique de l'article */
    @Column(unique = true)
    private String code;

    /** Nom du matériel */
    @Column(nullable = false)
    private String nom;

    /** Description détaillée */
    private String description;

    /** Catégorie du matériel */
    @ManyToOne
    @JoinColumn(name = "categorie_id")
    @JsonIgnoreProperties("materiels")
    private CategorieMateriel categorie;

    /** Statut actuel */
    @Enumerated(EnumType.STRING)
    private StatutMateriel statut;

    /** Quantité en stock */
    private Integer quantite;

    /** Numéro de série */
    private String numeroSerie;

    /** Date d'acquisition */
    private LocalDate dateAcquisition;

    /** Valeur d'achat */
    private Double valeurAchat;

    /** Employé actuellement assigné */
    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges", "user", "departement"})
    private Employe employe;

    /** Département de stockage */
    @ManyToOne
    @JoinColumn(name = "departement_id")
    @JsonIgnoreProperties("employes")
    private Departement departement;
}
