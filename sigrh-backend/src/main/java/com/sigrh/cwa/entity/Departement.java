package com.sigrh.cwa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "departements")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Departement {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nom;

    private String description;
    private String responsable;

    @OneToMany(mappedBy = "departement")
    private List<Employe> employes;
}
