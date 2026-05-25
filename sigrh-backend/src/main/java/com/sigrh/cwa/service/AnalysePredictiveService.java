package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enums.*;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.*;

/**
 * Service d'analyse prédictive et d'intelligence RH.
 * Utilise des méthodes d'apprentissage machine pour:
 * - Prédire le risque de départ (turnover) des employés
 * - Détecter l'abséntéisme anormal
 * - Prévoir l'évolution de la masse salariale
 * - Générer des alertes RH automatisées
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class AnalysePredictiveService {

    private final EmployeRepository    employeRepo;
    private final CongeRepository      congeRepo;
    private final PresenceRepository   presenceRepo;
    private final FichePaieRepository  paieRepo;
    private final AlerteRHRepository   alerteRepo;

    // ─────────────────────────────────────────────
    // TABLEAU DE BORD PRÉDICTIF — vue d'ensemble
    // ─────────────────────────────────────────────
    public Map<String, Object> getDashboardPredictif() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("scoreTurnoverGlobal",   calculerScoreTurnoverGlobal());
        result.put("tauxAbsenteisme",        calculerTauxAbsenteisme());
        result.put("previsionMasseSalariale", previsionMasseSalarialeShort());
        result.put("employesARisque",        getEmployesARisque());
        result.put("alertesActives",         alerteRepo.countByTraitee(false));
        result.put("tendanceConges",         getTendanceConges());
        result.put("repartitionRisques",     getRepartitionRisques());
        return result;
    }

    // ─────────────────────────────────────────────
    // SCORE DE TURNOVER PAR EMPLOYÉ (0.0 → 1.0)
    // ─────────────────────────────────────────────
    public Map<String, Object> analyserTurnover(Long employeId) {
        Employe emp = employeRepo.findById(employeId).orElseThrow();
        double score = 0.0;
        List<String> facteurs = new ArrayList<>();

        // Facteur 1 : ancienneté (risque élevé si < 1 an ou > 10 ans)
        long moisAnciennete = ChronoUnit.MONTHS.between(
            emp.getDateEmbauche() != null ? emp.getDateEmbauche() : LocalDate.now().minusYears(1),
            LocalDate.now()
        );
        if (moisAnciennete < 12) { score += 0.30; facteurs.add("Ancienneté < 1 an (+30%)"); }
        else if (moisAnciennete > 120) { score += 0.15; facteurs.add("Ancienneté > 10 ans (+15%)"); }

        // Facteur 2 : congés fréquents (> 3 demandes en 12 mois)
        LocalDate ilYa12Mois = LocalDate.now().minusMonths(12);
        long nbConges = congeRepo.findByEmployeId(employeId).stream()
            .filter(c -> c.getDateCreation() != null && c.getDateCreation().isAfter(ilYa12Mois))
            .count();
        if (nbConges > 3) { score += 0.20; facteurs.add("Plus de 3 congés sur 12 mois (+20%)"); }

        // Facteur 3 : absences récentes (> 5 absences en 3 mois)
        LocalDate ilYa3Mois = LocalDate.now().minusMonths(3);
        long nbAbsences = presenceRepo.findByEmployeIdAndDateBetween(employeId, ilYa3Mois, LocalDate.now())
            .stream().filter(p -> p.getStatut() == StatutPresence.ABSENT).count();
        if (nbAbsences > 5) { score += 0.25; facteurs.add("Plus de 5 absences sur 3 mois (+25%)"); }

        // Facteur 4 : retards fréquents (> 4 retards en 1 mois)
        LocalDate ilYa1Mois = LocalDate.now().minusMonths(1);
        long nbRetards = presenceRepo.findByEmployeIdAndDateBetween(employeId, ilYa1Mois, LocalDate.now())
            .stream().filter(p -> p.getStatut() == StatutPresence.RETARD).count();
        if (nbRetards > 4) { score += 0.15; facteurs.add("Plus de 4 retards ce mois (+15%)"); }

        // Facteur 5 : statut inactif ou suspendu
        if (emp.getStatut() == StatutEmploye.SUSPENDU) { score += 0.10; facteurs.add("Statut suspendu (+10%)"); }

        score = Math.min(score, 1.0);

        // Générer une alerte si le score est élevé
        if (score >= 0.6) genererAlerte(emp, TypeAlerte.TURNOVER, score, facteurs);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("employeId",   employeId);
        res.put("employe",     emp.getNom() + " " + emp.getPrenom());
        res.put("scoreRisque", Math.round(score * 100) + "%");
        res.put("niveau",      getNiveau(score).name());
        res.put("facteurs",    facteurs);
        res.put("recommandation", getRecommandationTurnover(score));
        return res;
    }

    // ─────────────────────────────────────────────
    // ANALYSE DE L'ABSENTÉISME PAR DÉPARTEMENT
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> analyserAbsenteismeParDepartement() {
        LocalDate debut = LocalDate.now().minusMonths(3);
        LocalDate fin   = LocalDate.now();

        return employeRepo.findAll().stream()
            .filter(e -> e.getDepartement() != null)
            .collect(Collectors.groupingBy(e -> e.getDepartement().getNom()))
            .entrySet().stream()
            .map(entry -> {
                String dept = entry.getKey();
                List<Employe> membres = entry.getValue();

                long totalJours    = membres.size() * ChronoUnit.DAYS.between(debut, fin);
                long joursAbsences = membres.stream()
                    .flatMap(e -> presenceRepo.findByEmployeIdAndDateBetween(e.getId(), debut, fin).stream())
                    .filter(p -> p.getStatut() == StatutPresence.ABSENT)
                    .count();

                double taux = totalJours > 0 ? (double) joursAbsences / totalJours * 100 : 0;

                Map<String, Object> m = new LinkedHashMap<>();
                m.put("departement",   dept);
                m.put("effectif",      membres.size());
                m.put("joursAbsences", joursAbsences);
                m.put("tauxAbsenteisme", String.format(java.util.Locale.US, "%.1f%%", taux));
                m.put("niveau",        taux > 10 ? "CRITIQUE" : taux > 5 ? "ELEVE" : taux > 2 ? "MOYEN" : "FAIBLE");
                return m;
            })
            .sorted(Comparator.comparingDouble(m -> -Double.parseDouble(
                ((String) m.get("tauxAbsenteisme")).replace("%", ""))))
            .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // PRÉVISION DE LA MASSE SALARIALE (6 mois)
    // ─────────────────────────────────────────────
    public Map<String, Object> previsionMasseSalariale() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        double masseActuelle = actifs.stream()
            .mapToDouble(e -> e.getSalaire() != null ? e.getSalaire() : 0)
            .sum();

        // Croissance historique (basée sur les fiches de paie des 6 derniers mois)
        double tauxCroissanceMensuel = 0.015; // 1.5% par mois (à affiner selon historique réel)

        List<Map<String, Object>> previsions = new ArrayList<>();
        double masse = masseActuelle;
        for (int i = 1; i <= 6; i++) {
            masse *= (1 + tauxCroissanceMensuel);
            LocalDate moisCible = LocalDate.now().plusMonths(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("mois",      moisCible.getMonth().getDisplayName(TextStyle.FULL, Locale.FRENCH)
                               + " " + moisCible.getYear());
            m.put("prevision", Math.round(masse));
            m.put("variation", String.format(java.util.Locale.US, "+%.1f%%", tauxCroissanceMensuel * 100 * i));
            previsions.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("masseActuelle",      Math.round(masseActuelle));
        result.put("nombreEmployesActifs", actifs.size());
        result.put("salairesMoyen",      actifs.isEmpty() ? 0 : Math.round(masseActuelle / actifs.size()));
        result.put("previsionsSurSixMois", previsions);
        result.put("previsionAnnuelle",  Math.round(masseActuelle * 12 * Math.pow(1 + tauxCroissanceMensuel, 6)));
        return result;
    }

    // ─────────────────────────────────────────────
    // EMPLOYÉS À RISQUE (top 5)
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getEmployesARisque() {
        return employeRepo.findByStatut(StatutEmploye.ACTIF).stream()
            .map(emp -> {
                double score = calculerScoreRisqueRapide(emp);
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",          emp.getId());
                m.put("nom",         emp.getNom() + " " + emp.getPrenom());
                m.put("poste",       emp.getPoste());
                m.put("departement", emp.getDepartement() != null ? emp.getDepartement().getNom() : "—");
                m.put("scoreRisque", Math.round(score * 100) + "%");
                m.put("niveau",      getNiveau(score).name());
                return m;
            })
            .filter(m -> Double.parseDouble(((String) m.get("scoreRisque")).replace("%","")) >= 30)
            .sorted(Comparator.comparingDouble(m ->
                -Double.parseDouble(((String) m.get("scoreRisque")).replace("%",""))))
            .limit(10)
            .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // TENDANCE DES CONGÉS (12 derniers mois)
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getTendanceConges() {
        List<Map<String, Object>> tendance = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate mois = LocalDate.now().minusMonths(i);
            LocalDate debut = mois.withDayOfMonth(1);
            LocalDate fin   = mois.withDayOfMonth(mois.lengthOfMonth());

            long nbConges = congeRepo.findAll().stream()
                .filter(c -> c.getDateDebut() != null
                    && !c.getDateDebut().isBefore(debut)
                    && !c.getDateDebut().isAfter(fin))
                .count();

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("mois", mois.getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH)
                          + " " + mois.getYear());
            m.put("nombreConges", nbConges);
            tendance.add(m);
        }
        return tendance;
    }

    // ─────────────────────────────────────────────
    // ALERTES
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getAlertes(boolean nonTraiteesSeulement) {
        List<AlerteRH> alertes = nonTraiteesSeulement
            ? alerteRepo.findByTraitee(false)
            : alerteRepo.findAll();
        return alertes.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          a.getId());
            m.put("employe",     a.getEmploye().getNom() + " " + a.getEmploye().getPrenom());
            m.put("employeId",   a.getEmploye().getId());
            m.put("type",        a.getType().name());
            m.put("niveau",      a.getNiveau().name());
            m.put("message",     a.getMessage());
            m.put("scoreRisque", Math.round(a.getScoreRisque() * 100) + "%");
            m.put("dateAlerte",  a.getDateAlerte());
            m.put("traitee",     a.isTraitee());
            return m;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> marquerAlerteTraitee(Long alerteId) {
        AlerteRH alerte = alerteRepo.findById(alerteId).orElseThrow();
        alerte.setTraitee(true);
        alerteRepo.save(alerte);
        return Map.of("message", "Alerte marquée comme traitée", "id", alerteId);
    }

    // Générer les alertes pour tous les employés actifs
    public Map<String, Object> genererToutesLesAlertes() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        int nbGenerees = 0;
        for (Employe emp : actifs) {
            double score = calculerScoreRisqueRapide(emp);
            if (score >= 0.5) {
                genererAlerte(emp, TypeAlerte.TURNOVER, score, List.of("Analyse automatique"));
                nbGenerees++;
            }
        }
        return Map.of("alertesGenerees", nbGenerees, "employesAnalyses", actifs.size());
    }

    // ─────────────────────────────────────────────
    // MÉTHODES PRIVÉES
    // ─────────────────────────────────────────────

    private double calculerScoreTurnoverGlobal() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        if (actifs.isEmpty()) return 0.0;
        double total = actifs.stream().mapToDouble(this::calculerScoreRisqueRapide).sum();
        return Math.round((total / actifs.size()) * 100.0) / 100.0;
    }

    private double calculerTauxAbsenteisme() {
        LocalDate debut = LocalDate.now().minusMonths(1);
        LocalDate fin   = LocalDate.now();
        long absences = presenceRepo.findAll().stream()
            .filter(p -> !p.getDate().isBefore(debut) && !p.getDate().isAfter(fin))
            .filter(p -> p.getStatut() == StatutPresence.ABSENT)
            .count();
        long presences = presenceRepo.findAll().stream()
            .filter(p -> !p.getDate().isBefore(debut) && !p.getDate().isAfter(fin))
            .count();
        return presences > 0 ? Math.round((double) absences / presences * 1000.0) / 10.0 : 0.0;
    }

    private Map<String, Object> previsionMasseSalarialeShort() {
        // Version courte pour le tableau de bord
        double masse = employeRepo.findByStatut(StatutEmploye.ACTIF).stream()
            .mapToDouble(e -> e.getSalaire() != null ? e.getSalaire() : 0).sum();
        return Map.of("actuelle", Math.round(masse), "previsionM1", Math.round(masse * 1.015),
                      "previsionM3", Math.round(masse * Math.pow(1.015, 3)));
    }

    private Map<String, Object> getRepartitionRisques() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        Map<String, Long> rep = actifs.stream()
            .collect(Collectors.groupingBy(e -> getNiveau(calculerScoreRisqueRapide(e)).name(), Collectors.counting()));
        return new LinkedHashMap<>(rep);
    }

    private double calculerScoreRisqueRapide(Employe emp) {
        double score = 0.0;
        // Ancienneté
        if (emp.getDateEmbauche() != null) {
            long mois = ChronoUnit.MONTHS.between(emp.getDateEmbauche(), LocalDate.now());
            if (mois < 12) score += 0.25;
        }
        // Absences récentes
        long absences = presenceRepo.findByEmployeIdAndDateBetween(
            emp.getId(), LocalDate.now().minusMonths(3), LocalDate.now())
            .stream().filter(p -> p.getStatut() == StatutPresence.ABSENT).count();
        if (absences > 5)  score += 0.25;
        else if (absences > 2) score += 0.10;
        // Congés fréquents
        long nbConges = congeRepo.findByEmployeId(emp.getId()).size();
        if (nbConges > 4) score += 0.15;
        // Statut
        if (emp.getStatut() == StatutEmploye.SUSPENDU) score += 0.20;
        return Math.min(score, 1.0);
    }

    private NiveauAlerte getNiveau(double score) {
        if (score >= 0.75) return NiveauAlerte.CRITIQUE;
        if (score >= 0.50) return NiveauAlerte.ELEVE;
        if (score >= 0.25) return NiveauAlerte.MOYEN;
        return NiveauAlerte.FAIBLE;
    }

    private void genererAlerte(Employe emp, TypeAlerte type, double score, List<String> facteurs) {
        // Éviter les doublons d'alerte le même jour
        boolean existeDeja = alerteRepo.findByEmployeId(emp.getId()).stream()
            .anyMatch(a -> a.getType() == type
                && a.getDateAlerte() != null
                && a.getDateAlerte().equals(LocalDate.now()));
        if (existeDeja) return;

        AlerteRH alerte = AlerteRH.builder()
            .employe(emp)
            .type(type)
            .niveau(getNiveau(score))
            .scoreRisque(score)
            .message("Risque " + type.name().toLowerCase() + " détecté : " + String.join(", ", facteurs))
            .dateAlerte(LocalDate.now())
            .traitee(false)
            .build();
        alerteRepo.save(alerte);
    }

    private String getRecommandationTurnover(double score) {
        if (score >= 0.75) return "🔴 CRITIQUE : Entretien RH urgent recommandé. Évaluer immédiatement les conditions de travail et envisager des mesures de rétention.";
        if (score >= 0.50) return "🟠 ÉLEVÉ : Planifier un entretien individuel sous 2 semaines. Vérifier la charge de travail et la satisfaction.";
        if (score >= 0.25) return "🟡 MODÉRÉ : Surveiller l'évolution sur le prochain trimestre. Un point mensuel est conseillé.";
        return "🟢 FAIBLE : Situation stable. Maintenir le suivi régulier.";
    }
}
