package com.sigrh.cwa.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entité représentant une catégorie de matériel.
 * Permet de classifier et organiser l'inventaire.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "categories_materiel")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CategorieMateriel {
    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nom de la catégorie unique */
    @Column(nullable = false, unique = true)
    private String nom;

    /** Description de la catégorie */
    private String description;
}
