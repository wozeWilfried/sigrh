package com.sigrh.cwa.security;

import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.entity.User;
import com.sigrh.cwa.enums.Role;
import com.sigrh.cwa.repository.EmployeRepository;
import com.sigrh.cwa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Classe utilitaire pour accéder aux informations de sécurité.
 * Permet d'obtenir l'utilisateur courant, son rôle, son employé et département.
 * Fournit également des méthodes pour vérifier les autorisations.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
public class SecurityHelper {

    private final UserRepository userRepo;
    private final EmployeRepository employeRepo;

    /**
     * Retourne l'utilisateur actuellement authentifié.
     * 
     * @return User ou null si non authentifié
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal()))
            return null;
        return userRepo.findByUsername(auth.getName()).orElse(null);
    }

    /**
     * Retourne l'employé associé à l'utilisateur courant.
     * 
     * @return Employe ou null si l'utilisateur n'a pas d'employé associé
     */
    public Employe getCurrentEmploye() {
        User user = getCurrentUser();
        if (user == null) return null;
        return user.getEmploye();
    }

    /**
     * Retourne l'identifiant de l'employé courant.
     * 
     * @return ID de l'employé ou null
     */
    public Long getCurrentEmployeId() {
        Employe emp = getCurrentEmploye();
        return emp != null ? emp.getId() : null;
    }

    /**
     * Retourne l'identifiant du département de l'employé courant.
     * 
     * @return ID du département ou null
     */
    public Long getCurrentDepartementId() {
        Employe emp = getCurrentEmploye();
        return emp != null && emp.getDepartement() != null ? emp.getDepartement().getId() : null;
    }

    /**
     * Vérifie si l'utilisateur courant est administrateur.
     * 
     * @return true si le rôle est ADMIN
     */
    public boolean isAdmin() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.ADMIN;
    }

    /**
     * Vérifie si l'utilisateur courant est RH.
     * 
     * @return true si le rôle est RH
     */
    public boolean isRh() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.RH;
    }

    /**
     * Vérifie si l'utilisateur courant est Admin ou RH.
     * 
     * @return true si le rôle est ADMIN ou RH
     */
    public boolean isAdminOrRh() {
        User user = getCurrentUser();
        return user != null && (user.getRole() == Role.ADMIN || user.getRole() == Role.RH);
    }

    /**
     * Vérifie si l'utilisateur courant est Manager.
     * 
     * @return true si le rôle est MANAGER
     */
    public boolean isManager() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.MANAGER;
    }

    public boolean isEmploye() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.EMPLOYE;
    }

    public boolean isSecretaire() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.SECRETAIRE;
    }

    public boolean isAdminOrRhOrSecretaire() {
        User user = getCurrentUser();
        return user != null && (user.getRole() == Role.ADMIN || user.getRole() == Role.RH || user.getRole() == Role.SECRETAIRE);
    }

    public boolean isSelf(Long employeId) {
        return employeId != null && employeId.equals(getCurrentEmployeId());
    }

    public boolean isSameDepartement(Long employeId) {
        if (employeId == null) return false;
        Employe target = employeRepo.findById(employeId).orElse(null);
        if (target == null || target.getDepartement() == null) return false;
        return target.getDepartement().getId().equals(getCurrentDepartementId());
    }

    public boolean canAccessEmploye(Long employeId) {
        if (employeId == null) return false;
        if (isAdminOrRh()) return true;
        if (isSecretaire()) return true;
        if (isManager() && isSameDepartement(employeId)) return true;
        return isSelf(employeId);
    }

    public boolean canManageEmploye(Long employeId) {
        if (employeId == null) return false;
        if (isAdmin()) return true;
        if (isRh()) return true;
        return false;
    }
}
