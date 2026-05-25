package com.sigrh.cwa.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * Filtre Spring Security pour l'authentification JWT.
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization.
 * Authentifie l'utilisateur si le token est valide.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    /** Utilitaire pour manipuler les tokens JWT */
    private final JwtUtil jwtUtil;

    /** Service pour charger les détails utilisateur */
    private final UserDetailsService userDetailsService;

    /**
     * Filtre chaque requête HTTP pour vérifier et valider le token JWT.
     * 
     * @param req Requête HTTP entrante
     * @param res Réponse HTTP
     * @param chain Chaîne de filtres Spring Security
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                var auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
