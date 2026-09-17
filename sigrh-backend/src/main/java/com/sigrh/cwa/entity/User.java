package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import com.sigrh.cwa.enums.Role;

/**
 * Entité représentant un compte utilisateur dans SIGRH.
 * Stocke les identifiants de connexion et le rôle de l'utilisateur.
 * Lié à une entité Employe pour les utilisateurs salariés.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nom d'utilisateur unique pour la connexion */
    @Column(unique = true, nullable = false)
    private String username;

    /** Mot de passe encodé (BCrypt) */
    @Column(nullable = false)
    private String password;

    /** Adresse email unique */
    @Column(unique = true, nullable = false)
    private String email;

    /** Rôle de l'utilisateur pour les autorisations */
    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN, RH, MANAGER, EMPLOYE

    /** Indique si le compte est actif */
    private boolean active = true;

    /** Indique si l'utilisateur doit changer son mot de passe à la première connexion */
    @Builder.Default
    private boolean firstLogin = true;

    /** Fin de validité du mot de passe temporaire (null = sans expiration). */
    private LocalDateTime tempPasswordExpiresAt;

    /** Mot de passe temporaire en clair (affiché à la RH tant qu'il est valable ; null après changement). */
    private String tempPasswordPlain;

    /** Employé associé (optionnel pour les admins) */
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("user")
    private Employe employe;
}
