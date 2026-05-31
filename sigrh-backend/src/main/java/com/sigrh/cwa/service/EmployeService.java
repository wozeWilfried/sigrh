package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.*;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.Genre;
import com.sigrh.cwa.enums.Role;
import com.sigrh.cwa.enums.StatutEmploye;
import com.sigrh.cwa.security.PasswordGenerator;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.sigrh.cwa.enums.StatutEmploye.*;

/**
 * Service de gestion des employés.
 * Permet de:
 * - Ajouter et modifier les données des employés (avec création automatique du compte utilisateur)
 * - Rechercher les employés
 * - Gérer les statuts (actif, inactif, suspendu)
 * - Filtrer l'accès selon les permissions
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository employeRepo;
    private final UserRepository userRepo;
    private final DepartementRepository deptRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecurityHelper security;

    /**
     * Récupère tous les employés avec filtres et pagination (accès filtré selon le rôle).
     *
     * @param page       Numéro de page
     * @param size       Taille de page
     * @param search     Texte de recherche
     * @param department Nom du département
     * @param position   Intitulé du poste
     * @param statut     Statut (ACTIF, INACTIF, SUSPENDU, EN_CONGE, DEPART)
     * @return Page d'employés avec métadonnées de pagination
     */
    public Map<String, Object> findAll(int page, int size, String search,
                                        String department, String position, String statut) {
        List<Employe> accessible = getAccessibleEmployees();

        Stream<Employe> stream = accessible.stream();

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            stream = stream.filter(e ->
                (e.getNom() != null && e.getNom().toLowerCase().contains(q)) ||
                (e.getPrenom() != null && e.getPrenom().toLowerCase().contains(q)) ||
                (e.getMatricule() != null && e.getMatricule().toLowerCase().contains(q)) ||
                (e.getPoste() != null && e.getPoste().toLowerCase().contains(q)) ||
                (e.getEmail() != null && e.getEmail().toLowerCase().contains(q))
            );
        }
        if (department != null && !department.isBlank()) {
            String dept = department.toLowerCase();
            stream = stream.filter(e ->
                e.getDepartement() != null && e.getDepartement().getNom() != null &&
                e.getDepartement().getNom().toLowerCase().contains(dept)
            );
        }
        if (position != null && !position.isBlank()) {
            String pos = position.toLowerCase();
            stream = stream.filter(e ->
                e.getPoste() != null && e.getPoste().toLowerCase().contains(pos)
            );
        }
        if (statut != null && !statut.isBlank()) {
            stream = stream.filter(e ->
                e.getStatut() != null && e.getStatut().name().equals(statut)
            );
        }

        List<EmployeDTO> dtos = stream.map(this::toDTO).collect(Collectors.toList());
        int totalElements = dtos.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) totalElements / size));
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<EmployeDTO> content = fromIndex >= totalElements ? List.of() : dtos.subList(fromIndex, toIndex);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("number", page);
        result.put("size", size);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        return result;
    }

    private List<Employe> getAccessibleEmployees() {
        List<Employe> all = employeRepo.findAll();
        if (security.isAdminOrRhOrSecretaire()) {
            return all;
        }
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return all.stream()
                .filter(e -> e.getDepartement() != null && e.getDepartement().getId().equals(deptId))
                .collect(Collectors.toList());
        }
        return all.stream()
            .filter(e -> e.getId().equals(security.getCurrentEmployeId()))
            .collect(Collectors.toList());
    }

    /**
     * Récupère un employé par son identifiant.
     * Vérifie les droits d'accès.
     * 
     * @param id Identifiant de l'employé
     * @return DTO de l'employé
     */
    public EmployeDTO findById(Long id) {
        Employe emp = employeRepo.findById(id).orElseThrow();
        if (!security.canAccessEmploye(id))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return toDTO(emp);
    }

    /**
     * Recherche des employés selon différents critères (nom, email, téléphone).
     * Opération réservée aux administrateurs et RH.
     * 
     * @param query Texte de recherche
     * @return Liste des employés correspondant à la recherche
     */
    public List<EmployeDTO> search(String query) {
        if (!security.isAdminOrRh())
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return employeRepo.search(query).stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Crée un nouvel employé avec son compte utilisateur.
     * Gère la génération du mot de passe, la création du compte User lié,
     * et l'envoi des identifiants par email.
     * <p>
     * Pour les rôles MANAGER et SECRETAIRE (ayant une interface dédiée),
     * le mot de passe temporaire est envoyé par email.
     * Pour les autres rôles (EMPLOYE par défaut), un simple message
     * de bienvenue est envoyé sans mot de passe.
     *
     * @param dto Données du nouvel employé
     * @return CreateEmployeResponse avec l'employé créé et le mot de passe temporaire
     */
    @Transactional
    public CreateEmployeResponse create(EmployeDTO dto) {
        String nom = dto.getNom() != null ? dto.getNom().toLowerCase() : "employe";
        String prenom = dto.getPrenom() != null ? dto.getPrenom().toLowerCase() : "nouveau";
        String baseUsername = (prenom + "." + nom).replaceAll("[^a-z.]", "");
        String username = baseUsername;
        int suffix = 1;
        while (userRepo.existsByUsername(username)) {
            username = baseUsername + suffix;
            suffix++;
        }

        String email = dto.getEmail();
        if (email == null || email.isBlank()) {
            email = username + "@sigrh.com";
        } else if (userRepo.existsByEmail(email)) {
            throw new RuntimeException("Un employé avec cet email existe déjà : " + email);
        }

        String rawPassword = PasswordGenerator.generate();

        Role role = Role.EMPLOYE;
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            try {
                role = Role.valueOf(dto.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                role = Role.EMPLOYE;
            }
        }
        boolean needsCredentials = role == Role.MANAGER || role == Role.SECRETAIRE;

        User user = User.builder()
            .username(username)
            .password(passwordEncoder.encode(rawPassword))
            .email(email)
            .role(role)
            .active(true)
            .firstLogin(needsCredentials)
            .build();
        user = userRepo.save(user);

        Employe e = toEntity(dto);
        if (e.getMatricule() == null || e.getMatricule().isBlank()) {
            e.setMatricule(generateMatricule());
        }
        e.setEmail(email);
        e.setUser(user);
        e = employeRepo.save(e);

        user.setEmploye(e);
        userRepo.save(user);

        if (needsCredentials) {
            emailService.sendCredentials(email, username, rawPassword);
        } else {
            emailService.sendWelcomeMessage(email, username);
        }

        String message = needsCredentials
            ? "Employé créé avec succès. Identifiants envoyés à " + email
            : "Employé créé avec succès. Un email de bienvenue a été envoyé à " + email;

        return CreateEmployeResponse.builder()
            .employe(toDTO(e))
            .tempPassword(rawPassword)
            .message(message)
            .build();
    }

    private String generateMatricule() {
        long count = employeRepo.count();
        return "EMP" + String.format("%03d", count + 1);
    }

    /**
     * Modifie les informations d'un employé existant.
     * 
     * @param id Identifiant de l'employé
     * @param dto Nouvelles données de l'employé
     * @return EmployeDTO mis à jour
     */
    @Transactional
    public EmployeDTO update(Long id, EmployeDTO dto) {
        Employe existing = employeRepo.findById(id).orElseThrow();
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(dto.getEmail());
        existing.setTelephone(dto.getTelephone());
        existing.setPoste(dto.getPoste());
        existing.setSalaire(dto.getSalaire());
        existing.setStatut(StatutEmploye.valueOf(dto.getStatut()));
        if (dto.getDepartementId() != null) {
            existing.setDepartement(deptRepo.findById(dto.getDepartementId()).orElseThrow());
        }
        return toDTO(employeRepo.save(existing));
    }

    private static final Map<StatutEmploye, Set<StatutEmploye>> VALID_TRANSITIONS = Map.of(
        ACTIF, Set.of(INACTIF, SUSPENDU, EN_CONGE, DEPART),
        INACTIF, Set.of(ACTIF, DEPART),
        SUSPENDU, Set.of(ACTIF, INACTIF, DEPART),
        EN_CONGE, Set.of(ACTIF, INACTIF, DEPART),
        DEPART, Set.of()
    );

    /**
     * Modifie le statut d'un employé.
     * Opération réservée aux administrateurs et RH.
     * Valide la transition selon les règles métier.
     *
     * @param id     Identifiant de l'employé
     * @param statut Nouveau statut (ACTIF, INACTIF, SUSPENDU, EN_CONGE, DEPART)
     * @return EmployeDTO mis à jour
     */
    @Transactional
    public EmployeDTO updateStatus(Long id, String statut) {
        Employe emp = employeRepo.findById(id).orElseThrow();
        StatutEmploye current = emp.getStatut();
        StatutEmploye target;
        try {
            target = StatutEmploye.valueOf(statut);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + statut);
        }

        if (current == target) {
            throw new IllegalArgumentException("L'employé a déjà le statut " + statut);
        }

        Set<StatutEmploye> allowed = VALID_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(target)) {
            throw new IllegalArgumentException(
                "Transition de statut invalide : " + current + " \u2192 " + target
            );
        }

        emp.setStatut(target);
        return toDTO(employeRepo.save(emp));
    }

    /**
     * Supprime un employé du système.
     * 
     * @param id Identifiant de l'employé à supprimer
     */
    @Transactional
    public void delete(Long id) {
        Employe emp = employeRepo.findById(id).orElseThrow();
        if (emp.getUser() != null) {
            userRepo.delete(emp.getUser());
        }
        employeRepo.deleteById(id);
    }

    private EmployeDTO toDTO(Employe e) {
        return EmployeDTO.builder()
            .id(e.getId()).matricule(e.getMatricule())
            .nom(e.getNom()).prenom(e.getPrenom())
            .email(e.getEmail()).telephone(e.getTelephone())
            .genre(e.getGenre() != null ? e.getGenre().name() : null)
            .dateNaissance(e.getDateNaissance()).dateEmbauche(e.getDateEmbauche())
            .poste(e.getPoste()).salaire(e.getSalaire()).photoUrl(e.getPhotoUrl())
            .departementId(e.getDepartement() != null ? e.getDepartement().getId() : null)
            .departementNom(e.getDepartement() != null ? e.getDepartement().getNom() : null)
            .statut(e.getStatut() != null ? e.getStatut().name() : null)
            .build();
    }

    private Employe toEntity(EmployeDTO dto) {
        Employe e = new Employe();
        e.setMatricule(dto.getMatricule());
        e.setNom(dto.getNom()); e.setPrenom(dto.getPrenom());
        e.setEmail(dto.getEmail()); e.setTelephone(dto.getTelephone());
        if (dto.getGenre() != null && !dto.getGenre().isBlank()) e.setGenre(Genre.valueOf(dto.getGenre()));
        e.setDateNaissance(dto.getDateNaissance());
        e.setDateEmbauche(dto.getDateEmbauche());
        e.setPoste(dto.getPoste()); e.setSalaire(dto.getSalaire());
        e.setStatut(StatutEmploye.ACTIF);
        if (dto.getDepartementId() != null) {
            e.setDepartement(deptRepo.findById(dto.getDepartementId()).orElseThrow());
        }
        return e;
    }
}
