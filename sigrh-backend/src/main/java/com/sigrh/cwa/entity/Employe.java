package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;
import com.sigrh.cwa.enums.Genre;
import com.sigrh.cwa.enums.StatutEmploye;

/**
 * Entité représentant un employé dans SIGRH.
 * Contient les informations personnelles, professionnelles et administratives.
 * Lié à un compte utilisateur pour l'authentification.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "employes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Employe {

    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Numéro de matricule unique */
    @Column(nullable = false)
    private String matricule;

    /** Nom de famille */
    private String nom;

    /** Prénom */
    private String prenom;

    /** Adresse email */
    private String email;

    /** Numéro de téléphone */
    private String telephone;

    /** Genre */
    @Enumerated(EnumType.STRING)
    private Genre genre;

    /** Date de naissance */
    private LocalDate dateNaissance;

    /** Date d'embauche */
    private LocalDate dateEmbauche;

    /** Poste/Fonction */
    private String poste;

    /** Salaire mensuel de base */
    private Double salaire;

    /** URL de la photo de profil */
    private String photoUrl;

    /** Département d'affectation */
    @ManyToOne
    @JoinColumn(name = "departement_id")
    @JsonIgnoreProperties("employes")
    private Departement departement;

    /** Compte utilisateur associé */
    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties("employe")
    private User user;

    /** Statut de l'employé */
    @Enumerated(EnumType.STRING)
    private StatutEmploye statut; // ACTIF, INACTIF, SUSPENDU

    /** Contrats de l'employé */
    @OneToMany(mappedBy = "employe")
    @JsonIgnoreProperties("employe")
    private List<Contrat> contrats;
}
