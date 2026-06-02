package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.security.JwtUtil;
import com.sigrh.cwa.security.TokenBlacklistService;
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
 * - Le rafraîchissement des tokens
 * - La déconnexion (blacklist des tokens)
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
    private final TokenBlacklistService blacklist;
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
        String accessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername(), user.getRole().name());

        Long employeId = user.getEmploye() != null ? user.getEmploye().getId() : null;
        Long departementId = user.getEmploye() != null && user.getEmploye().getDepartement() != null
            ? user.getEmploye().getDepartement().getId() : null;

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .username(user.getUsername())
                .employeId(employeId)
                .departementId(departementId)
                .firstLogin(user.isFirstLogin())
                .build();
    }

    public AuthResponse refresh(RefreshRequest request) {
        String oldRefresh = request.getRefreshToken();
        if (!jwtUtil.validateToken(oldRefresh) || !"refresh".equals(jwtUtil.getTokenType(oldRefresh))) {
            throw new IllegalArgumentException("Refresh token invalide ou expiré");
        }
        String jti = jwtUtil.getTokenId(oldRefresh);
        if (blacklist.isBlacklisted(jti)) {
            throw new IllegalArgumentException("Refresh token révoqué");
        }

        String username = jwtUtil.extractUsername(oldRefresh);
        User user = userRepository.findByUsername(username).orElseThrow();

        blacklist.blacklist(jti, jwtUtil.getExpiration(oldRefresh));

        String newAccess = jwtUtil.generateAccessToken(user.getUsername(), user.getRole().name());
        String newRefresh = jwtUtil.generateRefreshToken(user.getUsername(), user.getRole().name());

        Long employeId = user.getEmploye() != null ? user.getEmploye().getId() : null;
        Long departementId = user.getEmploye() != null && user.getEmploye().getDepartement() != null
            ? user.getEmploye().getDepartement().getId() : null;
            
        return AuthResponse.builder()
                .token(newAccess)
                .refreshToken(newRefresh)
                .role(user.getRole().name())
                .username(user.getUsername())
                .employeId(employeId)
                .departementId(departementId)
                .firstLogin(user.isFirstLogin())
                .build();
    }

    public void logout(LogoutRequest request) {
        if (request.getAccessToken() != null && jwtUtil.validateToken(request.getAccessToken())) {
            blacklist.blacklist(jwtUtil.getTokenId(request.getAccessToken()), jwtUtil.getExpiration(request.getAccessToken()));
        }
        if (request.getRefreshToken() != null && jwtUtil.validateToken(request.getRefreshToken())) {
            blacklist.blacklist(jwtUtil.getTokenId(request.getRefreshToken()), jwtUtil.getExpiration(request.getRefreshToken()));
        }
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

        User user = userRepository.findByUsername(username).orElseThrow();

        if (!user.isFirstLogin()) {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getCurrentPassword())
            );
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        if (user.getEmail() != null) {
            emailService.sendPasswordChanged(user.getEmail());
        }
    }
}