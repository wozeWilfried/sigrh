package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.security.JwtUtil;
import com.sigrh.cwa.security.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService blacklist;

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
}
