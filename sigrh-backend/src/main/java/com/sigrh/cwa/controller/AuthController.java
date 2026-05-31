package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Contrôleur REST pour l'authentification.
 * Gère les opérations de connexion, changement de mot de passe, rafraîchissement de token et déconnexion.
 * 
 * Points de terminaison:
 * - POST /api/auth/login
 * - POST /api/auth/change-password
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) {
        try {
            return ResponseEntity.ok(authService.refresh(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }
}