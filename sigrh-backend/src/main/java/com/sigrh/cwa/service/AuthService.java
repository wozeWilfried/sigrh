package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/**
 * Service d'authentification et d'autorisation.
 * Gère:
 * - L'authentification des utilisateurs (username/password)
 * - La génération des tokens JWT
 * - Les informations de session
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * Authentifie un utilisateur et génère un token JWT.
     * 
     * @param request Données de connexion (username et password)
     * @return Réponse contenant le token JWT, le rôle et les infos utilisateur
     * @throws AuthenticationException Si les identifiants sont invalides
     */
    public AuthResponse login(AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        Long employeId = user.getEmploye() != null ? user.getEmploye().getId() : null;
        return new AuthResponse(token, user.getRole().name(), user.getUsername(), employeId);
    }
}
