package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enums.*;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;
    private final CongeRepository congeRepo;
    private final PresenceRepository presenceRepo;
    private final FichePaieRepository paieRepo;
    private final AlerteRHRepository alerteRepo;
    private final MaterielRepository materielRepo;

    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("effectifs", getEffectifs());
        dashboard.put("genre", getRepartitionGenre());
        dashboard.put("agePyramide", getPyramideAges());
        dashboard.put("anciennete", getDistributionAnciennete());
        dashboard.put("departements", getStatsDepartements());
        dashboard.put("salaires", getStatsSalaires());
        dashboard.put("absenteisme", getAbsenteisme());
        dashboard.put("conges", getStatsConges());
        dashboard.put("presences", getStatsPresences());
        dashboard.put("paie", getStatsPaie());
        dashboard.put("materiel", getStatsMateriel());
        dashboard.put("alertes", getStatsAlertes());
        dashboard.put("turnover", getStatsTurnover());
        return dashboard;
    }

    private Map<String, Object> getEffectifs() {
        List<Employe> all = employeRepo.findAll();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("total", all.size());
        m.put("actifs", all.stream().filter(e -> e.getStatut() == StatutEmploye.ACTIF).count());
        m.put("inactifs", all.stream().filter(e -> e.getStatut() == StatutEmploye.INACTIF).count());
        m.put("suspendus", all.stream().filter(e -> e.getStatut() == StatutEmploye.SUSPENDU).count());
        return m;
    }

    private Map<String, Long> getRepartitionGenre() {
        List<Employe> all = employeRepo.findAll();
        return all.stream()
            .filter(e -> e.getGenre() != null)
            .collect(Collectors.groupingBy(e -> e.getGenre().name(), Collectors.counting()));
    }

    private Map<String, Long> getPyramideAges() {
        List<Employe> all = employeRepo.findAll();
        LocalDate now = LocalDate.now();
        Map<String, Long> pyramide = new LinkedHashMap<>();
        pyramide.put("moins25", all.stream().filter(e -> e.getDateNaissance() != null
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) < 25).count());
        pyramide.put("25-35", all.stream().filter(e -> e.getDateNaissance() != null
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) >= 25
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) < 35).count());
        pyramide.put("35-45", all.stream().filter(e -> e.getDateNaissance() != null
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) >= 35
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) < 45).count());
        pyramide.put("45-55", all.stream().filter(e -> e.getDateNaissance() != null
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) >= 45
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) < 55).count());
        pyramide.put("plus55", all.stream().filter(e -> e.getDateNaissance() != null
            && ChronoUnit.YEARS.between(e.getDateNaissance(), now) >= 55).count());
        return pyramide;
    }

    private Map<String, Long> getDistributionAnciennete() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        LocalDate now = LocalDate.now();
        Map<String, Long> dist = new LinkedHashMap<>();
        dist.put("moins1An", actifs.stream().filter(e -> e.getDateEmbauche() != null
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) < 12).count());
        dist.put("1-3Ans", actifs.stream().filter(e -> e.getDateEmbauche() != null
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) >= 12
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) < 36).count());
        dist.put("3-5Ans", actifs.stream().filter(e -> e.getDateEmbauche() != null
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) >= 36
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) < 60).count());
        dist.put("5-10Ans", actifs.stream().filter(e -> e.getDateEmbauche() != null
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) >= 60
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) < 120).count());
        dist.put("plus10Ans", actifs.stream().filter(e -> e.getDateEmbauche() != null
            && ChronoUnit.MONTHS.between(e.getDateEmbauche(), now) >= 120).count());
        return dist;
    }

    private List<Map<String, Object>> getStatsDepartements() {
        return deptRepo.findAll().stream().map(d -> {
            List<Employe> employes = d.getEmployes();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", d.getId());
            m.put("nom", d.getNom());
            m.put("effectif", employes.size());
            m.put("responsable", d.getResponsable());
            double salaireMoyen = employes.stream()
                .filter(e -> e.getSalaire() != null)
                .mapToDouble(Employe::getSalaire).average().orElse(0);
            m.put("salaireMoyen", Math.round(salaireMoyen));
            return m;
        }).collect(Collectors.toList());
    }

    private Map<String, Object> getStatsSalaires() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        List<Double> salaires = actifs.stream()
            .filter(e -> e.getSalaire() != null)
            .map(Employe::getSalaire)
            .sorted()
            .collect(Collectors.toList());

        Map<String, Object> m = new LinkedHashMap<>();
        if (salaires.isEmpty()) {
            m.put("moyen", 0); m.put("median", 0); m.put("min", 0); m.put("max", 0); m.put("total", 0);
            return m;
        }
        double total = salaires.stream().mapToDouble(Double::doubleValue).sum();
        double median = salaires.size() % 2 == 0
            ? (salaires.get(salaires.size()/2 - 1) + salaires.get(salaires.size()/2)) / 2
            : salaires.get(salaires.size()/2);
        m.put("moyen", Math.round(total / salaires.size()));
        m.put("median", Math.round(median));
        m.put("min", Math.round(salaires.get(0)));
        m.put("max", Math.round(salaires.get(salaires.size()-1)));
        m.put("total", Math.round(total));

        // Par département
        List<Map<String, Object>> parDept = deptRepo.findAll().stream().map(d -> {
            List<Employe> emps = d.getEmployes().stream()
                .filter(e -> e.getSalaire() != null && e.getStatut() == StatutEmploye.ACTIF)
                .collect(Collectors.toList());
            Map<String, Object> dm = new LinkedHashMap<>();
            dm.put("departement", d.getNom());
            dm.put("effectif", emps.size());
            dm.put("moyen", Math.round(emps.stream().mapToDouble(Employe::getSalaire).average().orElse(0)));
            dm.put("total", Math.round(emps.stream().mapToDouble(Employe::getSalaire).sum()));
            return dm;
        }).collect(Collectors.toList());
        m.put("parDepartement", parDept);

        return m;
    }

    private Map<String, Object> getAbsenteisme() {
        LocalDate debutMois = LocalDate.now().withDayOfMonth(1);
        LocalDate debutTrimestre = LocalDate.now().minusMonths(3);
        LocalDate fin = LocalDate.now();

        Map<String, Object> m = new LinkedHashMap<>();

        // Taux mensuel
        long totalMois = presenceRepo.findAll().stream()
            .filter(p -> !p.getDate().isBefore(debutMois) && !p.getDate().isAfter(fin)).count();
        long absMois = presenceRepo.findAll().stream()
            .filter(p -> !p.getDate().isBefore(debutMois) && !p.getDate().isAfter(fin))
            .filter(p -> p.getStatut() == StatutPresence.ABSENT).count();
        m.put("tauxMensuel", totalMois > 0 ? Math.round((double) absMois / totalMois * 1000.0) / 10.0 : 0);

        // Taux trimestriel
        long totalTrim = presenceRepo.findAll().stream()
            .filter(p -> !p.getDate().isBefore(debutTrimestre) && !p.getDate().isAfter(fin)).count();
        long absTrim = presenceRepo.findAll().stream()
            .filter(p -> !p.getDate().isBefore(debutTrimestre) && !p.getDate().isAfter(fin))
            .filter(p -> p.getStatut() == StatutPresence.ABSENT).count();
        m.put("tauxTrimestriel", totalTrim > 0 ? Math.round((double) absTrim / totalTrim * 1000.0) / 10.0 : 0);

        // Par département
        List<Map<String, Object>> parDept = deptRepo.findAll().stream().map(d -> {
            long absences = d.getEmployes().stream()
                .flatMap(e -> presenceRepo.findByEmployeIdAndDateBetween(e.getId(), debutTrimestre, fin).stream())
                .filter(p -> p.getStatut() == StatutPresence.ABSENT).count();
            long total = d.getEmployes().stream()
                .flatMap(e -> presenceRepo.findByEmployeIdAndDateBetween(e.getId(), debutTrimestre, fin).stream())
                .count();
            double taux = total > 0 ? (double) absences / total * 100 : 0;
            Map<String, Object> dm = new LinkedHashMap<>();
            dm.put("departement", d.getNom());
            dm.put("absences", absences);
            dm.put("totalPresences", total);
            dm.put("taux", String.format(java.util.Locale.US, "%.1f%%", taux));
            return dm;
        }).collect(Collectors.toList());
        m.put("parDepartement", parDept);

        return m;
    }

    private Map<String, Object> getStatsConges() {
        List<Conge> all = congeRepo.findAll();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("enAttente", all.stream().filter(c -> c.getStatut() == StatutConge.EN_ATTENTE).count());
        m.put("approuves", all.stream().filter(c -> c.getStatut() == StatutConge.APPROUVE).count());
        m.put("refuses", all.stream().filter(c -> c.getStatut() == StatutConge.REFUSE).count());
        m.put("total", all.size());

        // Taux d'approbation
        long traites = all.stream().filter(c -> c.getStatut() != StatutConge.EN_ATTENTE).count();
        long approuves = all.stream().filter(c -> c.getStatut() == StatutConge.APPROUVE).count();
        m.put("tauxApprobation", traites > 0 ? Math.round((double) approuves / traites * 100) : 0);

        // Par type de congé
        Map<String, Long> parType = all.stream()
            .collect(Collectors.groupingBy(c -> c.getType().name(), Collectors.counting()));
        m.put("parType", parType);

        // Tendance sur 12 mois
        List<Map<String, Object>> tendance = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate mois = LocalDate.now().minusMonths(i);
            LocalDate debut = mois.withDayOfMonth(1);
            LocalDate finMois = mois.withDayOfMonth(mois.lengthOfMonth());
            int moisCourant = i;
            long nb = all.stream()
                .filter(c -> c.getDateDebut() != null && !c.getDateDebut().isBefore(debut) && !c.getDateDebut().isAfter(finMois))
                .count();
            Map<String, Object> tm = new LinkedHashMap<>();
            tm.put("mois", mois.getMonth().toString() + " " + mois.getYear());
            tm.put("nombre", nb);
            tendance.add(tm);
        }
        m.put("tendance12Mois", tendance);

        return m;
    }

    private Map<String, Object> getStatsPresences() {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate debutMois = aujourdhui.withDayOfMonth(1);
        LocalDate finMois = aujourdhui.withDayOfMonth(aujourdhui.lengthOfMonth());

        Map<String, Object> m = new LinkedHashMap<>();

        // Aujourd'hui
        List<Presence> aujourdhuiList = presenceRepo.findByDate(aujourdhui);
        Map<String, Object> today = new LinkedHashMap<>();
        today.put("total", aujourdhuiList.size());
        today.put("presents", aujourdhuiList.stream().filter(p -> p.getStatut() == StatutPresence.PRESENT).count());
        today.put("absents", aujourdhuiList.stream().filter(p -> p.getStatut() == StatutPresence.ABSENT).count());
        today.put("retards", aujourdhuiList.stream().filter(p -> p.getStatut() == StatutPresence.RETARD).count());
        today.put("conges", aujourdhuiList.stream().filter(p -> p.getStatut() == StatutPresence.CONGE).count());
        m.put("aujourdhui", today);

        // Ce mois-ci
        List<Presence> ceMois = presenceRepo.findAll().stream()
            .filter(p -> !p.getDate().isBefore(debutMois) && !p.getDate().isAfter(finMois))
            .collect(Collectors.toList());
        Map<String, Object> month = new LinkedHashMap<>();
        month.put("total", ceMois.size());
        month.put("presents", ceMois.stream().filter(p -> p.getStatut() == StatutPresence.PRESENT).count());
        month.put("absents", ceMois.stream().filter(p -> p.getStatut() == StatutPresence.ABSENT).count());
        month.put("retards", ceMois.stream().filter(p -> p.getStatut() == StatutPresence.RETARD).count());
        month.put("conges", ceMois.stream().filter(p -> p.getStatut() == StatutPresence.CONGE).count());
        m.put("ceMois", month);

        return m;
    }

    private Map<String, Object> getStatsPaie() {
        List<FichePaie> all = paieRepo.findAll();
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);

        double masseActuelle = actifs.stream()
            .filter(e -> e.getSalaire() != null)
            .mapToDouble(Employe::getSalaire).sum();

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("masseSalariale", Math.round(masseActuelle));
        m.put("employesNonValides", all.stream().filter(f -> !f.isValide()).count());
        m.put("previsionM1", Math.round(masseActuelle * 1.015));
        m.put("previsionM3", Math.round(masseActuelle * Math.pow(1.015, 3)));
        m.put("previsionM6", Math.round(masseActuelle * Math.pow(1.015, 6)));

        return m;
    }

    private Map<String, Object> getStatsMateriel() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("total", materielRepo.count());
        m.put("disponible", materielRepo.countByStatut(StatutMateriel.DISPONIBLE));
        m.put("assigne", materielRepo.countByStatut(StatutMateriel.ASSIGNE));
        m.put("enMaintenance", materielRepo.countByStatut(StatutMateriel.EN_MAINTENANCE));
        m.put("horsService", materielRepo.countByStatut(StatutMateriel.HORS_SERVICE));
        return m;
    }

    private Map<String, Object> getStatsAlertes() {
        List<AlerteRH> all = alerteRepo.findAll();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("actives", all.stream().filter(a -> !a.isTraitee()).count());
        m.put("traitees", all.stream().filter(AlerteRH::isTraitee).count());
        m.put("total", all.size());
        Map<String, Long> parType = all.stream()
            .collect(Collectors.groupingBy(a -> a.getType().name(), Collectors.counting()));
        m.put("parType", parType);
        return m;
    }

    private Map<String, Object> getStatsTurnover() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        Map<String, Object> m = new LinkedHashMap<>();

        if (actifs.isEmpty()) {
            m.put("scoreMoyen", 0);
            m.put("employesARisque", 0);
            m.put("repartition", Collections.emptyMap());
            return m;
        }

        // Score moyen (logique de turnover simplifiée)
        double totalScore = actifs.stream().mapToDouble(this::calculerScoreRapide).sum();
        double scoreMoyen = Math.round(totalScore / actifs.size() * 100.0) / 100.0;
        m.put("scoreMoyen", scoreMoyen);

        long aRisque = actifs.stream().filter(e -> calculerScoreRapide(e) >= 0.5).count();
        m.put("employesARisque", aRisque);

        Map<String, Long> repartition = new LinkedHashMap<>();
        repartition.put("FAIBLE", actifs.stream().filter(e -> calculerScoreRapide(e) < 0.25).count());
        repartition.put("MOYEN", actifs.stream().filter(e -> calculerScoreRapide(e) >= 0.25 && calculerScoreRapide(e) < 0.5).count());
        repartition.put("ELEVE", actifs.stream().filter(e -> calculerScoreRapide(e) >= 0.5 && calculerScoreRapide(e) < 0.75).count());
        repartition.put("CRITIQUE", actifs.stream().filter(e -> calculerScoreRapide(e) >= 0.75).count());
        m.put("repartition", repartition);

        return m;
    }

    private double calculerScoreRapide(Employe emp) {
        double score = 0.0;
        if (emp.getDateEmbauche() != null) {
            long mois = ChronoUnit.MONTHS.between(emp.getDateEmbauche(), LocalDate.now());
            if (mois < 12) score += 0.25;
        }
        long absences = presenceRepo.findByEmployeIdAndDateBetween(
            emp.getId(), LocalDate.now().minusMonths(3), LocalDate.now())
            .stream().filter(p -> p.getStatut() == StatutPresence.ABSENT).count();
        if (absences > 5) score += 0.25;
        else if (absences > 2) score += 0.10;
        long nbConges = congeRepo.findByEmployeId(emp.getId()).size();
        if (nbConges > 4) score += 0.15;
        if (emp.getStatut() == StatutEmploye.SUSPENDU) score += 0.20;
        return Math.min(score, 1.0);
    }
}
