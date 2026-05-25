# 📊 MODULE ANALYSE PRÉDICTIVE — Documentation

## Vue d'ensemble

Le module **Analyse Prédictive** fournit des prédictions et alertes RH basées sur les données existantes :
- **Turnover probable** : Score de risque de départ par employé
- **Absentéisme** : Analyse par département avec tendances
- **Prévision masse salariale** : Projection sur 6 et 12 mois
- **Alertes automatiques** : Générations intelligentes avec scoring

Tout est calculé côté **backend en Java** (règles métier + statistiques) — aucune libraire ML externe requise.

---

## 🏗️ Architecture

### Entités
- **AlerteRH** : Entité principale pour stocker les alertes générées
- **TypeAlerte** : Énumération des types (TURNOVER, ABSENTEISME, CONGE_EXCESSIF, SALAIRE_ANORMAL, RETARDS_FREQUENTS)
- **NiveauAlerte** : Énumération des niveaux (FAIBLE, MOYEN, ELEVE, CRITIQUE)

### Repository
- **AlerteRHRepository** : Accès aux données avec filtres par traitement, employé, niveau

### Service
- **AnalysePredictiveService** : Logique métier complète

### Contrôleur
- **AnalysePredictiveController** : REST API pour tous les endpoints

---

## 📡 API REST — Endpoints

### 1. Dashboard Prédictif
```http
GET /api/predictif/dashboard
```
**Réponse** : Vue d'ensemble globale avec :
- Score turnover global
- Taux absentéisme
- Prévision masse salariale court terme
- Top employés à risque
- Nombre d'alertes actives
- Tendance congés
- Répartition des risques

**Exemple** :
```json
{
  "scoreTurnoverGlobal": 0.35,
  "tauxAbsenteisme": 3.2,
  "previsionMasseSalariale": {
    "actuelle": 250000,
    "previsionM1": 253750,
    "previsionM3": 261406
  },
  "employesARisque": [...],
  "alertesActives": 5,
  "tendanceConges": [...],
  "repartitionRisques": {
    "FAIBLE": 45,
    "MOYEN": 12,
    "ELEVE": 3,
    "CRITIQUE": 1
  }
}
```

---

### 2. Analyse Turnover par Employé
```http
GET /api/predictif/turnover/{employeId}
```
**Analyse complète du risque turnover** avec :
- Score de risque (0.0 → 1.0)
- Facteurs identifiés
- Niveau d'alerte
- Recommandation RH

**Facteurs analysés** :
- Ancienneté < 1 an (+30%)
- Ancienneté > 10 ans (+15%)
- Congés fréquents > 3 sur 12 mois (+20%)
- Absences récentes > 5 sur 3 mois (+25%)
- Retards fréquents > 4 sur 1 mois (+15%)
- Statut suspendu (+10%)

**Exemple** :
```json
{
  "employeId": 5,
  "employe": "Dupont Jean",
  "scoreRisque": "62%",
  "niveau": "ELEVE",
  "facteurs": [
    "Ancienneté < 1 an (+30%)",
    "Plus de 5 absences sur 3 mois (+25%)",
    "Plus de 3 congés sur 12 mois (+20%)"
  ],
  "recommandation": "🟠 ÉLEVÉ : Planifier un entretien individuel sous 2 semaines..."
}
```

---

### 3. Analyse Absentéisme par Département
```http
GET /api/predictif/absenteisme
```
**Répartition et tendances de l'absentéisme** par département sur les 3 derniers mois :
- Taux d'absentéisme
- Niveau de criticité
- Nombre d'absences

---

### 4. Prévision Masse Salariale
```http
GET /api/predictif/masse-salariale
```
**Projection sur 6 et 12 mois** avec :
- Masse actuelle
- Nombre d'employés actifs
- Salaire moyen
- Prévisions mensuelles détaillées
- Prévision annuelle

**Exemple** :
```json
{
  "masseActuelle": 1500000,
  "nombreEmployesActifs": 50,
  "salairesMoyen": 30000,
  "previsionsSurSixMois": [
    {
      "mois": "juin 2026",
      "prevision": 1522500,
      "variation": "+1.5%"
    },
    ...
  ],
  "previsionAnnuelle": 1911437
}
```

---

### 5. Employés à Risque
```http
GET /api/predictif/employes-risque
```
**Top 10 employés avec score de risque ≥ 30%** :
- Nom et poste
- Département
- Score risque
- Niveau

---

### 6. Tendance Congés
```http
GET /api/predictif/tendance-conges
```
**Historique des 12 derniers mois** avec nombre de congés demandés par mois.

---

### 7. Alertes
```http
GET /api/predictif/alertes?nonTraiteesSeulement=true
```
**Liste les alertes générées** (filtrées ou non).

**Paramètres** :
- `nonTraiteesSeulement` (bool) : true = seulement non traitées, false = toutes

---

### 8. Marquer une Alerte comme Traitée
```http
PUT /api/predictif/alertes/{alerteId}/traiter
```
Met à jour le statut `traitee` de l'alerte.

---

### 9. Générer Toutes les Alertes
```http
POST /api/predictif/alertes/generer
```
**Génère automatiquement les alertes** pour tous les employés actifs dont le score de risque ≥ 0.5.

**Réponse** :
```json
{
  "alertesGenerees": 8,
  "employesAnalyses": 50
}
```

---

## 🎯 Scoring de Risque

### Formule : Score Turnover (0.0 → 1.0)

| Facteur | Poids | Condition |
|---------|-------|-----------|
| Ancienneté < 1 an | +30% | Nouvel embauché = risque élevé |
| Ancienneté > 10 ans | +15% | Possible fatigue/départ à la retraite |
| Congés > 3 sur 12 mois | +20% | Potentiel manque de motivation |
| Absences > 5 sur 3 mois | +25% | Désengagement probable |
| Retards > 4 sur 1 mois | +15% | Problème personnel/travail |
| Statut suspendu | +10% | Discipline récente |

**Niveaux d'alerte** :
- ✅ **FAIBLE** : score < 0.25 → Situation stable
- 🟡 **MOYEN** : 0.25 ≤ score < 0.50 → Surveiller trimestriellement
- 🟠 **ELEVE** : 0.50 ≤ score < 0.75 → Entretien RH sous 2 semaines
- 🔴 **CRITIQUE** : score ≥ 0.75 → Entretien RH urgent

---

## 💡 Cas d'Usage

### Use Case 1 : Détection Proactive de Départs
```bash
curl http://localhost:8080/api/predictif/dashboard
```
**Objectif** : Vue hebdomadaire pour identifier les risques émergents.

### Use Case 2 : Audit Absentéisme Départemental
```bash
curl http://localhost:8080/api/predictif/absenteisme
```
**Objectif** : Identifier les départements problématiques.

### Use Case 3 : Budgétisation RH
```bash
curl http://localhost:8080/api/predictif/masse-salariale
```
**Objectif** : Prévoir la masse salariale pour les 6 prochains mois.

### Use Case 4 : Gestion Automatique des Alertes
```bash
curl -X POST http://localhost:8080/api/predictif/alertes/generer
curl http://localhost:8080/api/predictif/alertes?nonTraiteesSeulement=true
```
**Objectif** : Générer et consulter les alertes pour action RH.

---

## 📋 Règles Métier

1. **Pas de doublon d'alerte** : Une seule alerte du même type par employé par jour
2. **Score cumulatif** : Les facteurs s'ajoutent mais plafonné à 1.0
3. **Historiques** :
   - Ancienneté : depuis date embauche
   - Absences : 3 derniers mois
   - Congés : 12 derniers mois
   - Retards : 1 dernier mois
4. **Employés actifs uniquement** : Les employés non-actifs ne sont pas analysés

---

## 🔧 Configuration

### Paramètres Ajustables
Dans `AnalysePredictiveService.java`, adapter :
- **Facteurs de score** : Modifier les pourcentages (+30%, +20%, etc.)
- **Taux de croissance** : `tauxCroissanceMensuel` pour prévisions
- **Seuils d'alertes** : `score >= 0.5` pour génération
- **Périodes d'analyse** : `minusMonths(3)`, `minusMonths(12)`, etc.

---

## ✅ Checklist d'Implémentation

- ✅ Entité `AlerteRH` avec énumérations
- ✅ Repository `AlerteRHRepository`
- ✅ Service `AnalysePredictiveService` avec tous les calculs
- ✅ Contrôleur `AnalysePredictiveController`
- ✅ Compilation Maven réussie
- ✅ Documentation complète

---

## 🚀 Prochaines Étapes

1. Créer des tests unitaires pour les formules de scoring
2. Ajouter une planification JPA `@Scheduled` pour générer les alertes quotidiennement
3. Intégrer les notifications email pour alertes critiques
4. Créer un dashboard frontend (React/Angular) pour visualiser les données

