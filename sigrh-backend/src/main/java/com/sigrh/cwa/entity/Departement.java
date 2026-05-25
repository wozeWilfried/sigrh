package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

/**
 * Entité représentant un département organisationnel dans SIGRH.
 * Groups les employés par structure organisationnelle.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "departements")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Departement {

    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nom du département unique */
    @Column(unique = true, nullable = false)
    private String nom;

    /** Description du département */
    private String description;

    /** Nom du responsable/chef de département */
    private String responsable;

    /** Liste des employés du département */
    @OneToMany(mappedBy = "departement")
    @JsonIgnoreProperties({"departement", "user"})
    private List<Employe> employes;
}
