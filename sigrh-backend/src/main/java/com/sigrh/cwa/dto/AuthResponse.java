package com.sigrh.cwa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 * DTO pour la réponse d'authentification.
 * Contient le token JWT et les informations de l'utilisateur connecté.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String role;
    private String username;
    private Long employeId;
    private Long departementId;

    /** Indique si l'utilisateur doit changer son mot de passe (première connexion) */
    @Builder.Default
    private boolean firstLogin = false;
}