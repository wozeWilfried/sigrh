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

@Component
@RequiredArgsConstructor
public class SecurityHelper {

    private final UserRepository userRepo;
    private final EmployeRepository employeRepo;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal()))
            return null;
        return userRepo.findByUsername(auth.getName()).orElse(null);
    }

    public Employe getCurrentEmploye() {
        User user = getCurrentUser();
        if (user == null) return null;
        return user.getEmploye();
    }

    public Long getCurrentEmployeId() {
        Employe emp = getCurrentEmploye();
        return emp != null ? emp.getId() : null;
    }

    public Long getCurrentDepartementId() {
        Employe emp = getCurrentEmploye();
        return emp != null && emp.getDepartement() != null ? emp.getDepartement().getId() : null;
    }

    public boolean isAdmin() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.ADMIN;
    }

    public boolean isRh() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.RH;
    }

    public boolean isAdminOrRh() {
        User user = getCurrentUser();
        return user != null && (user.getRole() == Role.ADMIN || user.getRole() == Role.RH);
    }

    public boolean isManager() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.MANAGER;
    }

    public boolean isEmploye() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.EMPLOYE;
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
