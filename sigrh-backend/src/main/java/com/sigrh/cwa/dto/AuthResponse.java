package com.sigrh.cwa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO pour la réponse d'authentification.
 * Contient le token JWT et les informations de l'utilisateur connecté.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Data @AllArgsConstructor
public class AuthResponse {
    /** Token JWT valide pour accéder aux endpoints protégés */
    private String token;

    /** Rôle de l'utilisateur (ADMIN, RH, MANAGER, EMPLOYE) */
    private String role;

    /** Nom d'utilisateur */
    private String username;

    /** Identifiant de l'employé associé (null si c'est un admin) */
    private Long employeId;
}
