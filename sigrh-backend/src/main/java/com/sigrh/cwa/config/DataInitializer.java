package com.sigrh.cwa.config;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

/**
 * Initialise les données de test au démarrage de l'application.
 * Crée:
 * - Les comptes utilisateurs de test (Admin, RH, Manager, Employés)
 * - Les départements de base
 * - Les employés de test avec leurs données
 * 
 * Cette classe s'exécute une seule fois si la base est vide.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;
    private final PasswordEncoder passwordEncoder;

    /**
     * Exécute l'initialisation des données au démarrage.
     * 
     * @param args Arguments de ligne de commande (non utilisés)
     */
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
            User adminUser = createUser("admin", "admin123", "admin@sigrh.com", Role.ADMIN);
            createEmploye(adminUser, "EMP001", "Admin", "Système", "Directeur", Genre.MASCULIN,
                2000000.0, StatutEmploye.ACTIF, rh, "1985-03-15", "2010-01-01");

            // Ressources Humaines
            User rhUser = createUser("rh", "rh123", "rh@sigrh.com", Role.RH);
            createEmploye(rhUser, "EMP002", "Marie", "Diallo", "Responsable RH", Genre.FEMININ,
                1200000.0, StatutEmploye.ACTIF, rh, "1990-07-22", "2015-03-01");

            // Manager
            User mgrUser = createUser("manager", "manager123", "manager@sigrh.com", Role.MANAGER);
            createEmploye(mgrUser, "EMP003", "Jean", "Koné", "Chef de Projet", Genre.MASCULIN,
                1500000.0, StatutEmploye.ACTIF, it, "1988-11-10", "2012-06-15");

            // Employé (IT)
            User empUser = createUser("employe", "employe123", "employe@sigrh.com", Role.EMPLOYE);
            createEmploye(empUser, "EMP004", "Fatou", "Sy", "Développeur", Genre.FEMININ,
                800000.0, StatutEmploye.ACTIF, it, "1995-04-05", "2022-09-01");

            // Employé (Comptabilité)
            User empUser2 = createUser("employe2", "employe123", "employe2@sigrh.com", Role.EMPLOYE);
            createEmploye(empUser2, "EMP005", "Ousmane", "Cissé", "Comptable", Genre.MASCULIN,
                450000.0, StatutEmploye.ACTIF, compta, "1992-02-18", "2020-09-01");

            // Secrétaire
            User secUser = createUser("secretaire", "secretaire123", "secretaire@sigrh.com", Role.SECRETAIRE);
            createEmploye(secUser, "EMP006", "Aminata", "Ndiaye", "Secrétaire", Genre.FEMININ,
                500000.0, StatutEmploye.ACTIF, rh, "1993-08-12", "2021-03-01");

            System.out.println("✅ Données créées : admin/admin123, rh/rh123, manager/manager123, employe/employe123, secretaire/secretaire123");
        }
    }

    /**
     * Crée un nouvel utilisateur avec email et rôle.
     * Le mot de passe est encodé avec BCrypt.
     * 
     * @param username Nom d'utilisateur
     * @param password Mot de passe en clair
     * @param email Adresse email
     * @param role Rôle utilisateur (ADMIN, RH, MANAGER, EMPLOYE)
     * @return Utilisateur créé
     */
    private User createUser(String username, String password, String email, Role role) {
        User u = userRepo.save(User.builder()
            .username(username).password(passwordEncoder.encode(password))
            .email(email).role(role).active(true).build());
        return u;
    }

    /**
     * Crée un nouvel employé associé à un utilisateur.
     * 
     * @param user Utilisateur linké à l'employé
     * @param matricule Numéro de matricule de l'employé
     * @param nom Nom de famille
     * @param prenom Prénom
     * @param poste Fonction/Poste
     * @param genre Genre (MASCULIN, FEMININ)
     * @param salaire Salaire de base
     * @param statut Statut (ACTIF, INACTIF, SUSPENDU)
     * @param dept Département d'affectation
     * @param dateNaiss Date de naissance (format YYYY-MM-DD)
     * @param dateEmb Date d'embauche (format YYYY-MM-DD)
     */
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
