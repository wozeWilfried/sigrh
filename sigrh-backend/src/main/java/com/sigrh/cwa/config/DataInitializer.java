package com.sigrh.cwa.config;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Initialise un jeu de données de démonstration volumineux au premier démarrage.
 *
 * Crée les comptes de test, des départements, et un grand volume de données
 * (employés, contrats, congés, présences, fiches de paie, matériel, alertes)
 * afin que le client puisse tester l'application avec une base réaliste.
 *
 * Le volume est configurable via les propriétés {@code app.seed.*} et ne
 * s'exécute que si la base est vide.
 *
 * @author Équipe SIGRH
 * @version 2.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;
    private final ContratRepository contratRepo;
    private final SoldeCongeRepository soldeRepo;
    private final PresenceRepository presenceRepo;
    private final CongeRepository congeRepo;
    private final FichePaieRepository fichePaieRepo;
    private final CategorieMaterielRepository categorieRepo;
    private final MaterielRepository materielRepo;
    private final AttributionMaterielRepository attributionRepo;
    private final AlerteRHRepository alerteRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed.employees:150}")
    private int employeesCount;

    @Value("${app.seed.presence-days:30}")
    private int presenceDays;

    @Value("${app.seed.months-paie:6}")
    private int monthsPaie;

    @Value("${app.seed.materiels:200}")
    private int materielsCount;

    @Value("${app.seed.default-password:SIGRH@2026}")
    private String defaultPassword;

    private final Random random = new Random(20260101L);

    private static final String[] NOMS = {
        "Diallo", "Koné", "Talla", "Ngono", "Sy", "Cissé", "Ndiaye", "Traoré",
        "Kouassi", "Yao", "Bamba", "Ouattara", "Sow", "Bah", "Camara", "Touré",
        "Kouadio", "Gnahoré", "Kouamé", "Assamoi", "Zadi", "Mensah", "Adjovi",
        "Dossou", "Sagna", "Diop", "Fall", "Gueye", "Mbaye", "Faye", "Sarr",
        "Kaboré", "Ouédraogo", "Compaoré", "Sanou", "Zongo", "Sawadogo"
    };

    private static final String[] PRENOMS_M = {
        "Mamadou", "Ibrahim", "Ousmane", "Jean", "Patrick", "Serge", "Yannick",
        "Karim", "Amadou", "Cheikh", "Modou", "Alioune", "Omar", "Souleymane",
        "Boubacar", "Seydou", "Lassina", "Adama", "Issa", "Hamed", "Rachid",
        "Franck", "Cédric", "Boris", "Hervé", "Ange", "Prince", "Didier",
        "Eugène", "Wilfried", "Landry", "Armand", "Rodrigue", "Thierry"
    };

    private static final String[] PRENOMS_F = {
        "Aminata", "Fatou", "Marie", "Awa", "Nadège", "Carine", "Adjoua",
        "Bintou", "Kadiatou", "Mariama", "Aïcha", "Safiatou", "Djenabou",
        "Odette", "Prisca", "Sonia", "Léa", "Nadine", "Christelle", "Vanessa",
        "Estelle", "Mireille", "Ruth", "Grace", "Rebecca", "Gloria", "Anne",
        "Jeanne", "Clarisse", "Sylvie", "Béatrice", "Lucie", "Josiane"
    };

    /** Départements : nom, description, responsable */
    private static final String[][] DEPARTEMENTS = {
        {"Ressources Humaines", "Gestion du personnel, recrutement et paie", "Marie Diallo"},
        {"Informatique", "Développement, infrastructure et support", "Jean Koné"},
        {"Comptabilité", "Comptabilité générale et fiscale", "Ousmane Cissé"},
        {"Finance", "Trésorerie, budget et contrôle de gestion", "Fatou Sy"},
        {"Commercial", "Ventes et développement commercial", "Mamadou Ndiaye"},
        {"Marketing", "Communication et image de marque", "Awa Traoré"},
        {"Logistique", "Approvisionnement, stock et transport", "Ibrahim Bamba"},
        {"Exploitation", "Production et exploitation des services", "Omar Ouattara"},
        {"Qualité", "Qualité, hygiène et conformité", "Nadège Kouassi"},
        {"Juridique", "Affaires juridiques et réglementaires", "Serge Yao"},
        {"Systèmes d'Information", "Systèmes d'information et données", "Yannick Sow"},
        {"Direction", "Direction générale et stratégie", "Admin Système"}
    };

    private static final String[] POSTES = {
        "Assistant(e) administratif(ve)", "Chargé(e) de dossiers", "Comptable",
        "Analyste", "Développeur", "Ingénieur", "Technicien", "Superviseur",
        "Chef de service", "Responsable de département", "Gestionnaire RH",
        "Contrôleur de gestion", "Chargé de clientèle", "Assistant(e) de direction",
        "Agent de saisie", "Chargé de communication", "Chauffeur", "Agent de sécurité"
    };

    /** Catégories de matériel : nom, description */
    private static final String[][] CATEGORIES = {
        {"Informatique", "Ordinateurs, écrans et accessoires"},
        {"Téléphonie", "Téléphones et équipements de communication"},
        {"Mobilier", "Bureaux, chaises et armoires"},
        {"Véhicules", "Voitures et motos de service"},
        {"Réseau", "Routeurs, switchs et câblage"},
        {"Fournitures", "Papeterie et consommables"},
        {"Électroménager", "Climatiseurs et réfrigérateurs"},
        {"Outillage", "Outils et petit équipement technique"}
    };

    private static final String[] MODELES_INFORMATIQUE = {"Dell Latitude", "HP ProBook", "Lenovo ThinkPad", "MacBook Air", "Asus VivoBook", "Écran Dell 24\"", "Clavier Logitech", "Souris sans fil"};
    private static final String[] MODELES_TELEPHONIE = {"Samsung Galaxy A54", "iPhone 14", "Tecno Spark", "Xiaomi Redmi", "Téléphone fixe Panasonic"};
    private static final String[] MODELES_MOBILIER = {"Bureau directeur", "Chaise ergonomique", "Armoire métallique", "Table de réunion", "Caisson mobile"};
    private static final String[] MODELES_VEHICULES = {"Toyota Hilux", "Toyota Corolla", "Renault Duster", "Yamaha Moto", "Nissan Patrol"};
    private static final String[] MODELES_RESEAU = {"Routeur Cisco", "Switch TP-Link 24 ports", "Point d'accès Ubiquiti", "Firewall Fortinet"};
    private static final String[] MODELES_FOURNITURES = {"Ramette A4", "Cartouche encre HP", "Cahier 200 pages", "Boîte stylos"};
    private static final String[] MODELES_ELECTROMENAGER = {"Climatiseur Samsung 12000 BTU", "Réfrigérateur LG", "Micro-ondes", "Ventilateur brasseur"};
    private static final String[] MODELES_OUTILLAGE = {"Perceuse Bosch", "Perceuse-visseuse", "Groupe électrogène", "Poste à souder"};

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || userRepo.count() > 0) {
            return;
        }

        long start = System.currentTimeMillis();
        log.info("Initialisation des données de démonstration (employés={}, présences={} jours, paie={} mois, matériels={})…",
                employeesCount, presenceDays, monthsPaie, materielsCount);

        Map<String, Departement> departements = seedDepartements();
        List<Employe> employes = seedEmployes(departements);
        seedContrats(employes);
        seedSoldes(employes);
        seedPresences(employes);
        seedConges(employes);
        seedFichesPaie(employes);
        seedMateriel(employes);
        seedAlertes(employes);

        log.info("✅ Données créées en {} ms : {} départements, {} employés, {} contrats, {} soldes, {} présences, {} congés, {} fiches de paie, {} matériels, {} alertes.",
                System.currentTimeMillis() - start,
                deptRepo.count(), employeRepo.count(), contratRepo.count(), soldeRepo.count(),
                presenceRepo.count(), congeRepo.count(), fichePaieRepo.count(),
                materielRepo.count(), alerteRepo.count());
        log.info("🔑 Comptes de test : admin/admin123, rh/rh123, manager/manager123, employe/employe123, employe2/employe123, secretaire/secretaire123");
        log.info("🔑 Mots de passe des employés générés : {}", defaultPassword);
    }

    // ──────────────────────────────────────────────────────────────
    //  Départements
    // ──────────────────────────────────────────────────────────────
    private Map<String, Departement> seedDepartements() {
        List<Departement> depts = new ArrayList<>();
        for (String[] d : DEPARTEMENTS) {
            depts.add(Departement.builder()
                    .nom(d[0]).description(d[1]).responsable(d[2]).build());
        }
        deptRepo.saveAll(depts);
        Map<String, Departement> map = new HashMap<>();
        for (Departement d : depts) {
            map.put(d.getNom(), d);
        }
        return map;
    }

    // ──────────────────────────────────────────────────────────────
    //  Employés + comptes utilisateurs
    // ──────────────────────────────────────────────────────────────
    private List<Employe> seedEmployes(Map<String, Departement> depts) {
        List<User> users = new ArrayList<>();
        List<Employe> employes = new ArrayList<>();

        // --- 6 comptes de démonstration à identifiants fixes ---
        demo(users, employes, depts, "admin", "admin123", Role.ADMIN, "EMP001",
                "Système", "Admin", "Administrateur Système", Genre.MASCULIN, 950000,
                StatutEmploye.ACTIF, "Direction", "1985-03-12", "2015-01-05", "+2250700000001");
        demo(users, employes, depts, "rh", "rh123", Role.RH, "EMP002",
                "Diallo", "Marie", "Responsable RH", Genre.FEMININ, 750000,
                StatutEmploye.ACTIF, "Ressources Humaines", "1990-07-22", "2015-03-01", "+2250700000002");
        demo(users, employes, depts, "manager", "manager123", Role.MANAGER, "EMP003",
                "Koné", "Jean", "Chef de Projet", Genre.MASCULIN, 680000,
                StatutEmploye.ACTIF, "Systèmes d'Information", "1988-11-10", "2012-06-15", "+2250700000003");
        demo(users, employes, depts, "employe", "employe123", Role.EMPLOYE, "EMP004",
                "Sy", "Fatou", "Développeuse", Genre.FEMININ, 520000,
                StatutEmploye.ACTIF, "Informatique", "1995-04-05", "2022-09-01", "+2250700000004");
        demo(users, employes, depts, "employe2", "employe123", Role.EMPLOYE, "EMP005",
                "Cissé", "Ousmane", "Comptable", Genre.MASCULIN, 450000,
                StatutEmploye.ACTIF, "Comptabilité", "1992-02-18", "2020-09-01", "+2250700000005");
        demo(users, employes, depts, "secretaire", "secretaire123", Role.SECRETAIRE, "EMP006",
                "Ndiaye", "Aminata", "Secrétaire de direction", Genre.FEMININ, 400000,
                StatutEmploye.ACTIF, "Ressources Humaines", "1993-08-12", "2021-03-01", "+2250700000006");

        // --- Employés générés en masse ---
        String defaultHash = passwordEncoder.encode(defaultPassword);
        int total = Math.max(employeesCount, 6);
        for (int i = 7; i <= total; i++) {
            boolean feminin = random.nextBoolean();
            String prenom = feminin ? pick(PRENOMS_F) : pick(PRENOMS_M);
            String nom = pick(NOMS);
            Genre genre = feminin ? Genre.FEMININ : Genre.MASCULIN;

            String base = slug(prenom) + "." + slug(nom);
            String email = base + i + "@sigrh.com";
            Role role = Role.EMPLOYE;
            if (i % 25 == 0) role = Role.MANAGER;
            else if (i % 40 == 0) role = Role.RH;
            else if (i % 60 == 0) role = Role.SECRETAIRE;

            User user = newUser(base + i, defaultHash, email, role);
            users.add(user);

            Departement dept = pickDept(depts);
            LocalDate naissance = randomDate(LocalDate.of(1968, 1, 1), LocalDate.of(2001, 12, 31));
            LocalDate embauche = randomDate(LocalDate.of(2010, 1, 1), LocalDate.now().minusMonths(1));
            double salaire = round1000(300000 + random.nextInt(1_500_001));
            StatutEmploye statut = randomStatutEmploye();

            Employe e = Employe.builder()
                    .matricule(String.format("EMP%03d", i))
                    .nom(nom).prenom(prenom).email(email)
                    .telephone("+225" + (10 + random.nextInt(90)) + String.format("%06d", random.nextInt(1_000_000)))
                    .genre(genre)
                    .dateNaissance(naissance)
                    .dateEmbauche(embauche)
                    .poste(pick(POSTES))
                    .salaire(salaire)
                    .statut(statut)
                    .departement(dept)
                    .user(user)
                    .build();
            employes.add(e);
            user.setEmploye(e);
        }

        userRepo.saveAll(users);
        employeRepo.saveAll(employes);
        userRepo.saveAll(users); // consolide le lien user -> employé
        return employes;
    }

    private void demo(List<User> users, List<Employe> employes, Map<String, Departement> depts,
                      String username, String password, Role role, String matricule,
                      String nom, String prenom, String poste, Genre genre, double salaire,
                      StatutEmploye statut, String deptNom, String naissance, String embauche, String telephone) {
        String email = username + "@sigrh.com";
        User user = newUser(username, passwordEncoder.encode(password), email, role);
        users.add(user);
        Employe e = Employe.builder()
                .matricule(matricule).nom(nom).prenom(prenom).email(email)
                .telephone(telephone).genre(genre)
                .dateNaissance(LocalDate.parse(naissance))
                .dateEmbauche(LocalDate.parse(embauche))
                .poste(poste).salaire(salaire).statut(statut)
                .departement(depts.get(deptNom))
                .user(user)
                .build();
        employes.add(e);
        user.setEmploye(e);
    }

    // ──────────────────────────────────────────────────────────────
    //  Contrats
    // ──────────────────────────────────────────────────────────────
    private void seedContrats(List<Employe> employes) {
        List<Contrat> contrats = new ArrayList<>();
        for (Employe e : employes) {
            TypeContrat type = pickTypeContrat();
            LocalDate debut = e.getDateEmbauche();
            LocalDate fin = (type == TypeContrat.CDI) ? null : debut.plusMonths(12 + random.nextInt(24));
            StatutContrat statut = (e.getStatut() == StatutEmploye.ACTIF || e.getStatut() == StatutEmploye.EN_CONGE)
                    ? StatutContrat.ACTIF
                    : (e.getStatut() == StatutEmploye.DEPART ? StatutContrat.TERMINE : StatutContrat.RESILIE);
            contrats.add(Contrat.builder()
                    .reference("CTR-" + debut.getYear() + "-" + e.getMatricule())
                    .employe(e).type(type).dateDebut(debut).dateFin(fin)
                    .salaire(e.getSalaire()).poste(e.getPoste()).statut(statut)
                    .dateSignature(debut.minusDays(3 + random.nextInt(10)))
                    .description(type == TypeContrat.CDI ? "Contrat à durée indéterminée"
                            : "Contrat " + type.name().toLowerCase() + " pour le poste de " + e.getPoste())
                    .build());
        }
        contratRepo.saveAll(contrats);
    }

    // ──────────────────────────────────────────────────────────────
    //  Soldes de congés
    // ──────────────────────────────────────────────────────────────
    private void seedSoldes(List<Employe> employes) {
        List<SoldeConge> soldes = new ArrayList<>();
        int annee = LocalDate.now().getYear();
        for (Employe e : employes) {
            for (int an = annee - 1; an <= annee; an++) {
                soldes.add(SoldeConge.builder().employe(e).annee(an).type(TypeConge.ANNUEL)
                        .joursAcquis(24).joursConsommes(random.nextInt(16)).joursReportes(random.nextInt(6))
                        .dateMiseAJour(LocalDate.now()).build());
                soldes.add(SoldeConge.builder().employe(e).annee(an).type(TypeConge.MALADIE)
                        .joursAcquis(15).joursConsommes(random.nextInt(8)).joursReportes(0)
                        .dateMiseAJour(LocalDate.now()).build());
                soldes.add(SoldeConge.builder().employe(e).annee(an).type(TypeConge.EXCEPTIONNEL)
                        .joursAcquis(5).joursConsommes(random.nextInt(3)).joursReportes(0)
                        .dateMiseAJour(LocalDate.now()).build());
            }
        }
        soldeRepo.saveAll(soldes);
    }

    // ──────────────────────────────────────────────────────────────
    //  Présences
    // ──────────────────────────────────────────────────────────────
    private void seedPresences(List<Employe> employes) {
        List<LocalDate> jours = lastWorkingDays(presenceDays);
        List<Presence> presences = new ArrayList<>(employes.size() * jours.size());
        for (Employe e : employes) {
            for (LocalDate jour : jours) {
                int r = random.nextInt(100);
                StatutPresence statut;
                LocalTime arrivee = null;
                LocalTime depart = null;
                if (r < 82) {
                    statut = StatutPresence.PRESENT;
                    arrivee = LocalTime.of(7, 45).plusMinutes(random.nextInt(35));
                    depart = LocalTime.of(17, 0).plusMinutes(random.nextInt(30));
                } else if (r < 90) {
                    statut = StatutPresence.RETARD;
                    arrivee = LocalTime.of(8, 35).plusMinutes(random.nextInt(90));
                    depart = LocalTime.of(17, 0).plusMinutes(random.nextInt(20));
                } else if (r < 96) {
                    statut = StatutPresence.ABSENT;
                } else {
                    statut = StatutPresence.CONGE;
                }
                presences.add(Presence.builder()
                        .employe(e).date(jour)
                        .heureArrivee(arrivee).heureDepart(depart)
                        .statut(statut).build());
            }
        }
        presenceRepo.saveAll(presences);
    }

    // ──────────────────────────────────────────────────────────────
    //  Congés
    // ──────────────────────────────────────────────────────────────
    private void seedConges(List<Employe> employes) {
        List<Conge> conges = new ArrayList<>();
        String[] motifs = {"Congé annuel", "Raisons familiales", "Repos médical", "Voyage personnel",
                "Événement familial", "Suivi médical", "Formation personnelle"};
        for (Employe e : employes) {
            int n = 1 + random.nextInt(4);
            for (int k = 0; k < n; k++) {
                TypeConge type = pickTypeConge();
                LocalDate debut = LocalDate.now().minusDays(random.nextInt(365));
                int duree = 1 + random.nextInt(15);
                LocalDate fin = debut.plusDays(duree);
                StatutConge statut = pickStatutConge();
                conges.add(Conge.builder()
                        .employe(e).type(type)
                        .dateDebut(debut).dateFin(fin).nombreJours(duree + 1)
                        .motif(motifs[random.nextInt(motifs.length)])
                        .statut(statut)
                        .commentaireRH(statut == StatutConge.EN_ATTENTE ? null
                                : (statut == StatutConge.APPROUVE ? "Demande validée" : "Refusée : service en sous-effectif"))
                        .dateCreation(debut.minusDays(5 + random.nextInt(10)))
                        .build());
            }
        }
        congeRepo.saveAll(conges);
    }

    // ──────────────────────────────────────────────────────────────
    //  Fiches de paie
    // ──────────────────────────────────────────────────────────────
    private void seedFichesPaie(List<Employe> employes) {
        List<FichePaie> fiches = new ArrayList<>(employes.size() * monthsPaie);
        YearMonth courant = YearMonth.now();
        for (Employe e : employes) {
            for (int k = 0; k < monthsPaie; k++) {
                YearMonth ym = courant.minusMonths(k);
                double brut = round1000(e.getSalaire() * (1 + random.nextInt(11) / 100.0));
                double primes = random.nextInt(6) * 25000.0;
                double cnps = round1000(brut * 0.0518);
                double irpp = round1000(brut * 0.10);
                double autres = round1000(random.nextInt(3) * 10000.0);
                double net = round1000(brut + primes - cnps - irpp - autres);
                fiches.add(FichePaie.builder()
                        .employe(e).mois(ym.getMonthValue()).annee(ym.getYear())
                        .salaireBrut(brut).cotisationsCNPS(cnps).impotIRPP(irpp)
                        .autresRetenues(autres).primes(primes).salaireNet(net)
                        .dateGeneration(ym.atEndOfMonth())
                        .valide(k > 0)
                        .build());
            }
        }
        fichePaieRepo.saveAll(fiches);
    }

    // ──────────────────────────────────────────────────────────────
    //  Matériel + attributions
    // ──────────────────────────────────────────────────────────────
    private void seedMateriel(List<Employe> employes) {
        List<CategorieMateriel> categories = new ArrayList<>();
        for (String[] c : CATEGORIES) {
            categories.add(CategorieMateriel.builder().nom(c[0]).description(c[1]).build());
        }
        categorieRepo.saveAll(categories);

        List<Materiel> materiels = new ArrayList<>(materielsCount);
        for (int i = 1; i <= materielsCount; i++) {
            CategorieMateriel cat = categories.get(random.nextInt(categories.size()));
            String modele = pickModele(cat.getNom());
            StatutMateriel statut = pickStatutMateriel();
            Employe employe = null;
            Departement dept = pickRandomDepartement();
            if (statut == StatutMateriel.ASSIGNE && !employes.isEmpty()) {
                employe = employes.get(random.nextInt(employes.size()));
                dept = employe.getDepartement();
            }
            double valeur = round1000(25000 + random.nextInt(1_500_000));
            materiels.add(Materiel.builder()
                    .code(String.format("MAT-%04d", i))
                    .nom(cat.getNom() + " - " + modele)
                    .description("Équipement " + cat.getNom().toLowerCase() + " " + modele)
                    .categorie(cat).statut(statut)
                    .quantite(1 + random.nextInt(20))
                    .numeroSerie("SN-" + (100000 + random.nextInt(900000)))
                    .dateAcquisition(LocalDate.now().minusDays(random.nextInt(1500)))
                    .valeurAchat(valeur)
                    .employe(employe)
                    .departement(dept)
                    .build());
        }
        materielRepo.saveAll(materiels);

        List<AttributionMateriel> attributions = new ArrayList<>();
        for (Materiel m : materiels) {
            if (m.getEmploye() != null) {
                LocalDate dateAttr = LocalDate.now().minusDays(random.nextInt(400));
                attributions.add(AttributionMateriel.builder()
                        .materiel(m).employe(m.getEmploye())
                        .dateAttribution(dateAttr)
                        .retourne(false)
                        .motif("Mise à disposition pour le poste de " + m.getEmploye().getPoste())
                        .build());
            }
        }
        attributionRepo.saveAll(attributions);
    }

    // ──────────────────────────────────────────────────────────────
    //  Alertes RH
    // ──────────────────────────────────────────────────────────────
    private void seedAlertes(List<Employe> employes) {
        List<AlerteRH> alertes = new ArrayList<>();
        for (Employe e : employes) {
            if (random.nextInt(100) < 35) {
                int n = 1 + random.nextInt(2);
                for (int k = 0; k < n; k++) {
                    TypeAlerte type = pickTypeAlerte();
                    NiveauAlerte niveau = pickNiveauAlerte();
                    double score = Math.round((0.3 + random.nextDouble() * 0.7) * 100) / 100.0;
                    alertes.add(AlerteRH.builder()
                            .employe(e).type(type).niveau(niveau)
                            .scoreRisque(score)
                            .message(messageAlerte(type, e))
                            .dateAlerte(LocalDate.now().minusDays(random.nextInt(30)))
                            .traitee(random.nextInt(100) < 20)
                            .build());
                }
            }
        }
        alerteRepo.saveAll(alertes);
    }

    private String messageAlerte(TypeAlerte type, Employe e) {
        String qui = e.getPrenom() + " " + e.getNom();
        switch (type) {
            case TURNOVER:
                return qui + " présente un risque de départ élevé selon le modèle prédictif.";
            case ABSENTEISME:
                return "Taux d'absentéisme anormal détecté pour " + qui + ".";
            case CONGE_EXCESSIF:
                return qui + " a consommé un volume de congés supérieur à la moyenne.";
            case SALAIRE_ANORMAL:
                return "Anomalie de salaire détectée sur la fiche de " + qui + ".";
            case RETARDS_FREQUENTS:
                return qui + " cumule plusieurs retards répétés ce mois-ci.";
            default:
                return "Alerte RH concernant " + qui + ".";
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Utilitaires
    // ──────────────────────────────────────────────────────────────
    private User newUser(String username, String passwordHash, String email, Role role) {
        return User.builder()
                .username(username).password(passwordHash)
                .email(email).role(role).active(true).firstLogin(false)
                .build();
    }

    private Departement pickDept(Map<String, Departement> depts) {
        List<Departement> liste = new ArrayList<>(depts.values());
        return liste.get(random.nextInt(liste.size()));
    }

    private Departement pickRandomDepartement() {
        List<Departement> liste = deptRepo.findAll();
        return liste.isEmpty() ? null : liste.get(random.nextInt(liste.size()));
    }

    private String pick(String[] arr) {
        return arr[random.nextInt(arr.length)];
    }

    private String pickModele(String categorie) {
        switch (categorie) {
            case "Informatique": return pick(MODELES_INFORMATIQUE);
            case "Téléphonie": return pick(MODELES_TELEPHONIE);
            case "Mobilier": return pick(MODELES_MOBILIER);
            case "Véhicules": return pick(MODELES_VEHICULES);
            case "Réseau": return pick(MODELES_RESEAU);
            case "Fournitures": return pick(MODELES_FOURNITURES);
            case "Électroménager": return pick(MODELES_ELECTROMENAGER);
            default: return pick(MODELES_OUTILLAGE);
        }
    }

    private TypeContrat pickTypeContrat() {
        int r = random.nextInt(100);
        if (r < 60) return TypeContrat.CDI;
        if (r < 80) return TypeContrat.CDD;
        if (r < 90) return TypeContrat.STAGE;
        if (r < 96) return TypeContrat.ALTERNANCE;
        return TypeContrat.PRESTATION;
    }

    private TypeConge pickTypeConge() {
        int r = random.nextInt(100);
        if (r < 60) return TypeConge.ANNUEL;
        if (r < 78) return TypeConge.MALADIE;
        if (r < 88) return TypeConge.EXCEPTIONNEL;
        if (r < 95) return TypeConge.MATERNITE;
        return TypeConge.SANS_SOLDE;
    }

    private StatutConge pickStatutConge() {
        int r = random.nextInt(100);
        if (r < 50) return StatutConge.APPROUVE;
        if (r < 80) return StatutConge.EN_ATTENTE;
        return StatutConge.REFUSE;
    }

    private StatutMateriel pickStatutMateriel() {
        int r = random.nextInt(100);
        if (r < 55) return StatutMateriel.ASSIGNE;
        if (r < 80) return StatutMateriel.DISPONIBLE;
        if (r < 93) return StatutMateriel.EN_MAINTENANCE;
        return StatutMateriel.HORS_SERVICE;
    }

    private TypeAlerte pickTypeAlerte() {
        TypeAlerte[] valeurs = TypeAlerte.values();
        return valeurs[random.nextInt(valeurs.length)];
    }

    private NiveauAlerte pickNiveauAlerte() {
        int r = random.nextInt(100);
        if (r < 35) return NiveauAlerte.FAIBLE;
        if (r < 65) return NiveauAlerte.MOYEN;
        if (r < 88) return NiveauAlerte.ELEVE;
        return NiveauAlerte.CRITIQUE;
    }

    private StatutEmploye randomStatutEmploye() {
        int r = random.nextInt(100);
        if (r < 82) return StatutEmploye.ACTIF;
        if (r < 90) return StatutEmploye.EN_CONGE;
        if (r < 96) return StatutEmploye.INACTIF;
        if (r < 99) return StatutEmploye.SUSPENDU;
        return StatutEmploye.DEPART;
    }

    private LocalDate randomDate(LocalDate min, LocalDate max) {
        long jours = min.until(max).getDays() + 1;
        return min.plusDays(random.nextInt((int) Math.max(1, jours)));
    }

    private List<LocalDate> lastWorkingDays(int nombre) {
        List<LocalDate> jours = new ArrayList<>(nombre);
        LocalDate d = LocalDate.now();
        while (jours.size() < nombre) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                jours.add(d);
            }
            d = d.minusDays(1);
        }
        return jours;
    }

    private static double round1000(double valeur) {
        return Math.round(valeur / 1000.0) * 1000.0;
    }

    private static String slug(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return n.toLowerCase().replaceAll("[^a-z0-9]+", "");
    }
}