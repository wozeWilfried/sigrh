package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour l'authentification.
 * Gère les opérations de connexion et génération de tokens JWT.
 * 
 * Point de terminaison: POST /api/auth/login
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
}
