package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur REST pour l'authentification.
 * Gère les opérations de connexion, changement de mot de passe.
 * 
 * Points de terminaison:
 * - POST /api/auth/login
 * - POST /api/auth/change-password
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint de connexion - Authentifie un utilisateur et retourne un token JWT.
     * 
     * @param request Données de connexion (username, password)
     * @return Token JWT valide avec les informations de l'utilisateur
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Endpoint de changement de mot de passe.
     * Utilisé notamment pour la première connexion (firstLogin).
     * 
     * @param request Contient l'ancien et le nouveau mot de passe
     * @return Message de confirmation
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}
