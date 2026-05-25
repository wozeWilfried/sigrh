package com.sigrh.cwa.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

/**
 * Utilitaire pour la gestion des tokens JWT (JSON Web Tokens).
 * Permet de:
 * - Générer des tokens JWT signés
 * - Extraire les informations du token
 * - Valider l'authenticité d'un token
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Component
public class JwtUtil {

    /** Clé secrète pour signer les tokens (injectée depuis application.properties) */
    @Value("${jwt.secret}")
    private String secret;

    /** Durée de vie du token en millisecondes (injectée depuis application.properties) */
    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * Génère la clé de signature HMAC pour le token JWT.
     * 
     * @return Clé de signature
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Génère un nouveau token JWT avec le username et le rôle.
     * 
     * @param username Nom d'utilisateur à intrustion dans le token
     * @param role Rôle de l'utilisateur à insérer comme claim
     * @return Token JWT signé et encodé
     */
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrait le nom d'utilisateur (subject) du token JWT.
     * 
     * @param token Token JWT à analyser
     * @return Nom d'utilisateur
     * @throws JwtException En cas de token invalide
     */
    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Valide l'authenticité et l'intégrité d'un token JWT.
     * Vérifie la signature et la date d'expiration.
     * 
     * @param token Token JWT à valider
     * @return true si le token est valide, false sinon
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
