package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service d'authentification et d'autorisation.
 * Gère:
 * - L'authentification des utilisateurs (username/password)
 * - La génération des tokens JWT
 * - Le changement de mot de passe obligatoire (première connexion)
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
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Authentifie un utilisateur et génère un token JWT.
     * Retourne également si l'utilisateur doit changer son mot de passe (firstLogin).
     * 
     * @param request Données de connexion (username et password)
     * @return Réponse contenant le token JWT, le rôle, les infos utilisateur et le flag firstLogin
     * @throws AuthenticationException Si les identifiants sont invalides
     */
    public AuthResponse login(AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        Long employeId = user.getEmploye() != null ? user.getEmploye().getId() : null;

        return AuthResponse.builder()
            .token(token)
            .role(user.getRole().name())
            .username(user.getUsername())
            .employeId(employeId)
            .firstLogin(user.isFirstLogin())
            .build();
    }

    /**
     * Change le mot de passe de l'utilisateur connecté.
     * Utilisé notamment pour la première connexion (firstLogin).
     * Après le changement, le flag firstLogin passe à false.
     *
     * @param request Contient l'ancien et le nouveau mot de passe
     * @throws BadCredentialsException Si l'ancien mot de passe est incorrect
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String username = org.springframework.security.core.context.SecurityContextHolder
            .getContext().getAuthentication().getName();

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, request.getCurrentPassword())
        );

        User user = userRepository.findByUsername(username).orElseThrow();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        if (user.getEmail() != null) {
            emailService.sendPasswordChanged(user.getEmail());
        }
    }
}
