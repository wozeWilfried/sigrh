package com.sigrh.cwa.dto;

import lombok.*;
import java.time.LocalDate;

/**
 * DTO pour transférer les données d'un employé via l'API REST.
 * Utilisé pour l'entrée/sortie (création, mise à jour, consultatation).
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeDTO {
    /** Identifiant unique */
    private Long id;

    /** Numéro de matricule */
    private String matricule;

    /** Nom de famille */
    private String nom;

    /** Prénom */
    private String prenom;

    /** Adresse email */
    private String email;

    /** Numéro de téléphone */
    private String telephone;

    /** Genre (MASCULIN, FEMININ) */
    private String genre;

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

    /** Identifiant du département */
    private Long departementId;

    /** Nom du département */
    private String departementNom;

    /** Statut (ACTIF, INACTIF, SUSPENDU) */
    private String statut;
}
