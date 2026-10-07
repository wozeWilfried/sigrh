package com.sigrh.cwa.dto;

import lombok.*;
import java.time.LocalDate;

/**
 * Représente le profil de l'utilisateur actuellement connecté.
 * Regroupe les informations du compte utilisateur et, lorsqu'il existe,
 * les informations de l'employé associé.
 *
 * @author Équipe SIGRH
 * @version 1.0
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfilDTO {

    /** Identifiant de l'employé associé (null si aucun) */
    private Long employeId;

    /** Nom d'utilisateur (identifiant de connexion) */
    private String username;

    /** Rôle applicatif (ADMIN, RH, MANAGER, EMPLOYE, SECRETAIRE) */
    private String role;

    /** Adresse email */
    private String email;

    /** Nom de famille */
    private String nom;

    /** Prénom */
    private String prenom;

    /** Téléphone */
    private String telephone;

    /** Adresse postale */
    private String adresse;

    /** Photo de profil (URL ou data URL base64) */
    private String photoUrl;

    /** Poste occupé */
    private String poste;

    /** Nom du département */
    private String departementNom;

    /** Matricule */
    private String matricule;

    /** Statut de l'employé */
    private String statut;

    /** Genre */
    private String genre;

    /** Date d'embauche */
    private LocalDate dateEmbauche;

    /** Date de naissance */
    private LocalDate dateNaissance;
}