# 🔐 Configuration Sécurité — Endpoints Analyse Prédictive

## À Ajouter dans `SecurityConfig.java`

Dans la méthode `filterChain()`, ajouter la règle suivante pour protéger les endpoints d'analyse :

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                // Routes publiques
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Routes RH — Analyse Prédictive
                .requestMatchers("/api/analyse/**").hasAnyRole("ADMIN", "RH")
                
                // Routes employés
                .requestMatchers("/api/employes/**").hasAnyRole("ADMIN", "RH", "MANAGER")
                .requestMatchers("/api/conges/**").hasAnyRole("ADMIN", "RH", "EMPLOYE")
                .requestMatchers("/api/presences/**").hasAnyRole("ADMIN", "RH", "MANAGER")
                .requestMatchers("/api/paie/**").hasAnyRole("ADMIN", "RH")
                .requestMatchers("/api/departements/**").hasAnyRole("ADMIN", "RH")
                
                // Routes recherche
                .requestMatchers("/api/search/**").hasAnyRole("ADMIN", "RH", "EMPLOYE")
                
                // Autres routes nécessitent authentification
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## 📋 Rôles Autorisés par Endpoint

| Endpoint | GET | POST | PUT | Rôles Autorisés |
|----------|-----|------|-----|-----------------|
| `/api/analyse/**` | ✅ | ✅ | ✅ | ADMIN, RH |
| `/api/employes/**` | ✅ | ✅ | ✅ | ADMIN, RH, MANAGER |
| `/api/conges/**` | ✅ | ✅ | ✅ | ADMIN, RH, EMPLOYE |
| `/api/presences/**` | ✅ | ✅ | ✅ | ADMIN, RH, MANAGER |
| `/api/paie/**` | ✅ | ✅ | ✅ | ADMIN, RH |
| `/api/departements/**` | ✅ | ✅ | ✅ | ADMIN, RH |

---

## 🎯 Endpoints Analyse Prédictive Protégés

```
✅ GET    /api/analyse/dashboard              → ADMIN, RH
✅ GET    /api/analyse/turnover              → ADMIN, RH
✅ GET    /api/analyse/turnover/{id}         → ADMIN, RH
✅ GET    /api/analyse/absenteisme           → ADMIN, RH
✅ GET    /api/analyse/masse-salariale       → ADMIN, RH
✅ GET    /api/analyse/tendance-conges       → ADMIN, RH
✅ GET    /api/analyse/alertes               → ADMIN, RH
✅ PUT    /api/analyse/alertes/{id}/traiter  → ADMIN, RH
✅ POST   /api/analyse/alertes/generer       → ADMIN, RH
```

---

## 🔑 Exemple de Token JWT

Lors du login via `/api/auth/login`, vous recevez un token JWT :

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer"
}
```

**À utiliser dans l'en-tête** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Notes

1. Les utilisateurs avec le rôle `RH` peuvent accéder à tous les endpoints d'analyse
2. Les utilisateurs avec le rôle `ADMIN` ont un accès complet
3. Les autres rôles sont restreints à leurs endpoints spécifiques
4. Tous les endpoints d'analyse nécessitent JWT valide dans `Authorization` header

