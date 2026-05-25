package com.sigrh.cwa.config;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() == 0) {
            // Département par défaut
            Departement rh = deptRepo.save(Departement.builder()
                .nom("Ressources Humaines").description("Département RH").build());

            // Admin
            User admin = userRepo.save(User.builder()
                .username("admin").password(passwordEncoder.encode("admin123"))
                .email("admin@sigrh.com").role(Role.ADMIN).active(true).build());

            Employe adminEmp = employeRepo.save(Employe.builder()
                .matricule("EMP001").nom("Admin").prenom("Système")
                .email("admin@sigrh.com").poste("Administrateur")
                .statut(StatutEmploye.ACTIF).departement(rh).user(admin).build());

            admin.setEmploye(adminEmp);
            userRepo.save(admin);

            System.out.println("✅ Données initiales créées — admin/admin123");
        }
    }
}
