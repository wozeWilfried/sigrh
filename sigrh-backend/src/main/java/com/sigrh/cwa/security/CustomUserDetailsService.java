package com.sigrh.cwa.security;

import com.sigrh.cwa.entity.User;
import com.sigrh.cwa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

/**
 * Service Spring Security pour charger les détails utilisateur depuis la base de données.
 * Implémente UserDetailsService pour l'intégration Spring Security.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Charge les détails utilisateur depuis la base pour l'authentification.
     * 
     * @param username Nom d'utilisateur à chercher
     * @return UserDetails avec les droits et le mot de passe
     * @throws UsernameNotFoundException Si l'utilisateur n'existe pas
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));

        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password(user.getPassword())
            .roles(user.getRole().name())
            .accountExpired(!user.isActive())
            .build();
    }
}
