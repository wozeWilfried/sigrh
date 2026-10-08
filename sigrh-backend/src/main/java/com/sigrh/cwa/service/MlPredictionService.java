package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.enums.StatutEmploye;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MlPredictionService {

    private final RestTemplate restTemplate;
    private final EmployeRepository employeRepo;
    private final PresenceRepository presenceRepo;
    private final CongeRepository congeRepo;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private static final int TIMEOUT_MS = 5000;

    /**
     * Prédit le turnover pour un employé via le service ML Python.
     * Fallback vers le calcul heuristique si le service est indisponible.
     */
    public Map<String, Object> predictTurnover(Long employeId) {
        Employe emp = employeRepo.findById(employeId).orElseThrow();
        Map<String, Object> features = extractFeatures(emp);

        Map<String, Object> result = null;
        try {
            Map<String, Object> request = Map.of("employe", features);
            result = restTemplate.postForObject(
                mlServiceUrl + "/predict", request, Map.class);
        } catch (Exception e) {
            // Fallback local
        }

        if (result == null) result = fallbackPredict(emp, features);
        applyRetirementOverride(result, emp);
        return result;
    }

    /**
     * Prédit le turnover pour tous les employés actifs (batch).
     */
    public List<Map<String, Object>> predictAllTurnover() {
        List<Employe> actifs = employeRepo.findByStatut(StatutEmploye.ACTIF);
        List<Map<String, Object>> employesData = actifs.stream()
            .map(this::extractFeatures)
            .collect(Collectors.toList());

        List<Map<String, Object>> results = null;
        try {
            Map<String, Object> request = Map.of("employes", employesData);
            var response = restTemplate.postForObject(
                mlServiceUrl + "/predict/batch", request, List.class);
            if (response != null) results = response;
        } catch (Exception e) {
            // Fallback local
        }

        if (results == null) {
            results = actifs.stream()
                .map(emp -> fallbackPredict(emp, extractFeatures(emp)))
                .collect(Collectors.toList());
        }

        // Intègre le départ en retraite (départ certain) dans chaque prédiction
        Map<Long, Employe> parId = actifs.stream()
            .collect(Collectors.toMap(Employe::getId, e -> e, (a, b) -> a));
        for (Map<String, Object> r : results) {
            if (r == null) continue;
            Object id = r.get("employeId") != null ? r.get("employeId") : r.get("id");
            if (r.get("id") == null) r.put("id", r.get("employeId"));
            if (id instanceof Number) {
                applyRetirementOverride(r, parId.get(((Number) id).longValue()));
            }
        }
        return results;
    }

    /**
     * Vérifie si le service ML Python est disponible.
     */
    public boolean isMlServiceAvailable() {
        try {
            var response = restTemplate.getForObject(mlServiceUrl + "/health", Map.class);
            return response != null && "healthy".equals(response.get("status"));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Récupère les informations du modèle ML.
     */
    public Map<String, Object> getModelInfo() {
        try {
            var response = restTemplate.getForObject(mlServiceUrl + "/model", Map.class);
            if (response != null) return response;
        } catch (Exception e) {
            // Ignoré
        }
        return Map.of("loaded", false, "error", "Service ML indisponible");
    }

    /**
     * Entraîne le modèle ML avec données synthétiques.
     */
    public Map<String, Object> trainModel(int nSamples) {
        try {
            var response = restTemplate.postForObject(
                mlServiceUrl + "/train?n_synthetique=" + nSamples, null, Map.class);
            if (response != null) return response;
        } catch (Exception e) {
            // Ignoré
        }
        return Map.of("status", "error", "message", "Service ML indisponible");
    }

    /**
     * Extrait et normalise les features d'un employé pour le modèle ML.
     */
    private Map<String, Object> extractFeatures(Employe emp) {
        long ancienneteMois = emp.getDateEmbauche() != null
            ? ChronoUnit.MONTHS.between(emp.getDateEmbauche(), LocalDate.now())
            : 12;

        long age = emp.getDateNaissance() != null
            ? ChronoUnit.YEARS.between(emp.getDateNaissance(), LocalDate.now())
            : 30;

        long nbAbsences = presenceRepo
            .findByEmployeIdAndDateBetween(emp.getId(), LocalDate.now().minusMonths(3), LocalDate.now())
            .stream().filter(p -> p.getStatut() == null).count();

        long nbRetards = presenceRepo
            .findByEmployeIdAndDateBetween(emp.getId(), LocalDate.now().minusMonths(1), LocalDate.now())
            .stream().filter(p -> p.getStatut() == null).count();

        long nbConges = congeRepo.findByEmployeId(emp.getId()).size();

        Map<String, Object> features = new LinkedHashMap<>();
        features.put("employeId", emp.getId());
        features.put("nom", emp.getNom());
        features.put("prenom", emp.getPrenom());
        features.put("poste", emp.getPoste());
        features.put("departement", emp.getDepartement() != null ? emp.getDepartement().getNom() : "");
        features.put("age", (int) Math.min(age, 65));
        features.put("ancienneteMois", (int) Math.min(ancienneteMois, 360));
        features.put("salaire", emp.getSalaire() != null ? emp.getSalaire() : 0);
        features.put("genre", emp.getGenre() != null && emp.getGenre().name().equals("FEMININ") ? 1 : 0);
        features.put("nbAbsences3Mois", (int) Math.min(nbAbsences, 15));
        features.put("nbRetards1Mois", (int) Math.min(nbRetards, 8));
        features.put("nbConges12Mois", (int) Math.min(nbConges, 10));
        features.put("statutActif", emp.getStatut() == StatutEmploye.ACTIF ? 1 : 0);
        return features;
    }

    /**
     * Calcul heuristique de fallback quand le service ML est indisponible.
     */
    private Map<String, Object> fallbackPredict(Employe emp, Map<String, Object> features) {
        double score = 0.0;
        List<String> facteurs = new ArrayList<>();

        long anciennete = ((Number) features.get("ancienneteMois")).longValue();
        if (anciennete < 12) { score += 0.30; facteurs.add("Ancienneté < 1 an (+30%)"); }
        else if (anciennete > 120) { score += 0.15; facteurs.add("Ancienneté > 10 ans (+15%)"); }

        int absences = ((Number) features.get("nbAbsences3Mois")).intValue();
        if (absences > 5) { score += 0.25; facteurs.add("Absences fréquentes (+25%)"); }
        else if (absences > 2) { score += 0.10; facteurs.add("Absences modérées (+10%)"); }

        int conges = ((Number) features.get("nbConges12Mois")).intValue();
        if (conges > 4) { score += 0.15; facteurs.add("Congés fréquents (+15%)"); }

        int retards = ((Number) features.get("nbRetards1Mois")).intValue();
        if (retards > 4) { score += 0.15; facteurs.add("Retards fréquents (+15%)"); }

        double salaire = ((Number) features.get("salaire")).doubleValue();
        if (salaire < 400000) { score += 0.10; facteurs.add("Salaire bas (+10%)"); }

        int age = ((Number) features.get("age")).intValue();
        if (age < 25) { score += 0.08; facteurs.add("Âge jeune (+8%)"); }

        score = Math.min(score, 1.0);

        String niveau = score >= 0.75 ? "CRITIQUE" : score >= 0.50 ? "ELEVE" : score >= 0.25 ? "MOYEN" : "FAIBLE";
        String recommandation = getRecommandation(niveau);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("employeId", emp.getId());
        result.put("nom", emp.getNom());
        result.put("prenom", emp.getPrenom());
        result.put("poste", emp.getPoste());
        result.put("departement", emp.getDepartement() != null ? emp.getDepartement().getNom() : "");
        result.put("scoreRisque", Math.round(score * 10000.0) / 10000.0);
        result.put("niveau", niveau);
        result.put("probabilite", Math.round(score * 10000.0) / 10000.0);
        result.put("facteursRisque", facteurs);
        result.put("recommandation", recommandation);
        result.put("mlActif", false);
        return result;
    }

    private String getRecommandation(String niveau) {
        return switch (niveau) {
            case "CRITIQUE" ->
                "Action immédiate requise : entretien RH d'urgence sous 48h. Évaluer conditions de travail.";
            case "ELEVE" ->
                "Plan d'action sous 2 semaines : entretien individuel approfondi. Vérifier satisfaction.";
            case "MOYEN" ->
                "Surveillance trimestrielle : point mensuel recommandé. Suivre évolution absences et congés.";
            default ->
                "Situation stable : aucune action urgente. Continuer suivi RH standard.";
        };
    }

    /**
     * Intègre le départ en retraite dans la prédiction de turnover.
     * Un employé ayant atteint l'âge légal (60 ans) ou au statut RETRAITE
     * représente un départ certain ; le risque augmente dès 55 ans.
     *
     * @param result prédiction à enrichir (peut être null)
     * @param emp    employé concerné
     */
    private void applyRetirementOverride(Map<String, Object> result, Employe emp) {
        if (result == null || emp == null || emp.getDateNaissance() == null) return;

        long age = ChronoUnit.YEARS.between(emp.getDateNaissance(), LocalDate.now());
        boolean retraite = emp.getStatut() == StatutEmploye.RETRAITE
            || age >= RetraiteService.AGE_LEGAL_RETRAITE;
        if (!retraite && age < 55) return;

        double plancher = retraite ? 0.95 : (age >= 58 ? 0.65 : 0.45);
        double courant = toDouble(result.get("scoreRisque"));
        double score = Math.max(courant, plancher);

        String niveau = score >= 0.75 ? "CRITIQUE" : score >= 0.50 ? "ELEVE"
            : score >= 0.25 ? "MOYEN" : "FAIBLE";
        double arrondi = Math.round(score * 10000.0) / 10000.0;

        result.put("scoreRisque", arrondi);
        result.put("probabilite", arrondi);
        result.put("niveau", niveau);
        result.put("recommandation", getRecommandation(niveau));
        if (result.get("nom") != null) {
            result.put("employeNom", result.get("nom") + " " + result.get("prenom"));
        }
        if (result.get("facteurs") == null) result.put("facteurs", new ArrayList<String>());

        @SuppressWarnings("unchecked")
        List<String> facteurs = result.get("facteurs") instanceof List
            ? (List<String>) result.get("facteurs")
            : new ArrayList<String>();
        String libelle = retraite
            ? "Départ en retraite (âge légal " + RetraiteService.AGE_LEGAL_RETRAITE + " ans)"
            : "Proche de la retraite (âge " + age + " ans)";
        if (facteurs.stream().noneMatch(f -> f != null && f.contains("retraite"))) {
            facteurs.add(libelle);
        }
        result.put("facteurs", facteurs);
        result.put("facteursRisque", facteurs);
    }

    private double toDouble(Object value) {
        return value instanceof Number ? ((Number) value).doubleValue() : 0.0;
    }
}
