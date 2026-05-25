package com.sigrh.cwa.dto;

import lombok.Data;

/**
 * DTO pour la requête de connexion.
 * Contient les identifiants de l'utilisateur.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Data
public class AuthRequest {
    /** Nom d'utilisateur */
    private String username;

    /** Mot de passe */
    private String password;
}
