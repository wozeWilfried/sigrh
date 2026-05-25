package com.sigrh.cwa.config;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

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
            Departement rh = deptRepo.save(Departement.builder()
                .nom("Ressources Humaines").description("Département RH").responsable("Admin Système").build());
            Departement it = deptRepo.save(Departement.builder()
                .nom("Informatique").description("Département IT").responsable("Manager IT").build());
            Departement compta = deptRepo.save(Departement.builder()
                .nom("Comptabilité").description("Département Comptabilité").build());

            // Administrateur

            // Ressources Humaines

            // Manager

            // Employé (IT)

            // Employé (Comptabilité)
            User empUser2 = createUser("employe2", "employe123", "employe2@sigrh.com", Role.EMPLOYE);
            createEmploye(empUser2, "EMP005", "Ousmane", "Cissé", "Comptable", Genre.MASCULIN,
                450000.0, StatutEmploye.ACTIF, compta, "1992-02-18", "2020-09-01");

            System.out.println("✅ Données créées : admin/admin123, rh/rh123, manager/manager123, employe/employe123");
        }
    }

    private User createUser(String username, String password, String email, Role role) {
        User u = userRepo.save(User.builder()
            .username(username).password(passwordEncoder.encode(password))
            .email(email).role(role).active(true).build());
        return u;
    }

    private void createEmploye(User user, String matricule, String nom, String prenom,
            String poste, Genre genre, double salaire, StatutEmploye statut,
            Departement dept, String dateNaiss, String dateEmb) {
        Employe e = employeRepo.save(Employe.builder()
            .matricule(matricule).nom(nom).prenom(prenom)
            .email(user.getEmail()).poste(poste)
            .genre(genre).salaire(salaire).statut(statut)
            .departement(dept).user(user)
            .dateNaissance(LocalDate.parse(dateNaiss))
            .dateEmbauche(LocalDate.parse(dateEmb))
            .build());
        user.setEmploye(e);
        userRepo.save(user);
    }
}
