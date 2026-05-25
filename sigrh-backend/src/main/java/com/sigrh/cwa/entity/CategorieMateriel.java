package com.sigrh.cwa.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories_materiel")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CategorieMateriel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String description;
}
