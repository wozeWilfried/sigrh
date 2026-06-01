package com.sigrh.cwa.config;

import com.sigrh.cwa.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration de sécurité Spring Security avec authentification JWT.
 * Définit:
 * - Les règles d'autorisation par rôle (ADMIN, RH, MANAGER, EMPLOYE)
 * - L'authentification sans session (STATELESS)
 * - Les endpoints publics et protégés
 * - L'encodage des mots de passe
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    /**
     * Configure la chaîne de filtres de sécurité HTTP.
     * Définit les autorisations par rôle et les endpoints publics.
     * 
     * @param http Configuration HTTP Security
     * @return Chaîne de filtres de sécurité
     * @throws Exception En cas d'erreur de configuration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── PUBLIQUE ──
                .requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/logout",
                    "/api-docs/**", "/swagger-ui/**",
                    "/swagger-ui.html", "/webjars/**", "/v3/api-docs/**").permitAll()

                // ── ADMIN UNIQUEMENT (règles spécifiques AVANT les règles générales) ──
                .requestMatchers(HttpMethod.DELETE, "/api/departements/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/employes/*").hasRole("ADMIN")

                // ── ADMIN + RH UNIQUEMENT ──
                .requestMatchers(HttpMethod.GET, "/api/departements/**").hasAnyRole("ADMIN", "RH", "MANAGER")
                .requestMatchers("/api/departements/**").hasAnyRole("ADMIN", "RH")
                .requestMatchers("/api/analyse/**").hasAnyRole("ADMIN", "RH")
                .requestMatchers("/api/ia/**").hasAnyRole("ADMIN", "RH", "MANAGER")
                .requestMatchers("/api/ai/**").hasAnyRole("ADMIN", "RH", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/employes").hasAnyRole("ADMIN", "RH")
                .requestMatchers(HttpMethod.PUT, "/api/employes/*").hasAnyRole("ADMIN", "RH")
                .requestMatchers(HttpMethod.PATCH, "/api/employes/*/status").hasAnyRole("ADMIN", "RH")
                .requestMatchers(HttpMethod.POST, "/api/paie/generer").hasAnyRole("ADMIN", "RH")
                .requestMatchers(HttpMethod.PUT, "/api/paie/*/valider").hasAnyRole("ADMIN", "RH")
                .requestMatchers(HttpMethod.PUT, "/api/conges/*/valider").hasAnyRole("ADMIN", "RH", "MANAGER")

                // ── ADMIN + RH + SECRETAIRE ──
                .requestMatchers("/api/contrats/**").hasAnyRole("ADMIN", "RH", "SECRETAIRE")
                .requestMatchers("/api/materiel/**").hasAnyRole("ADMIN", "RH", "SECRETAIRE", "MANAGER")
                .requestMatchers("/api/export/**").hasAnyRole("ADMIN", "RH", "SECRETAIRE")
                .requestMatchers("/api/rapports/**").hasAnyRole("ADMIN", "RH")
                .requestMatchers("/api/dashboard/**", "/api/search").hasAnyRole("ADMIN", "RH", "SECRETAIRE", "MANAGER")

                // ── AUTHENTIFIÉ (contrôle d'accès affiné dans les services) ──
                .requestMatchers("/api/employes/**").authenticated()
                .requestMatchers("/api/conges/**").authenticated()
                .requestMatchers("/api/presences/**").authenticated()
                .requestMatchers("/api/paie/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Encodeur de mots de passe utilisant BCrypt.
     * Les mots de passe sont hashés de manière sécurisée.
     * 
     * @return Encodeur BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    /**
     * Gestionnaire d'authentification pour valider les identifiants.
     * 
     * @param config Configuration d'authentification
     * @return Gestionnaire d'authentification
     * @throws Exception En cas d'erreur de configuration
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
