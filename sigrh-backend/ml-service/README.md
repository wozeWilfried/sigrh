# SIGRH - Service de Prédiction ML (XGBoost)

Microservice Python de prédiction de turnover RH basé sur XGBoost.

## Architecture

```
Spring Boot (Java 17) ──HTTP──> Python FastAPI + XGBoost
      port 8080                    port 8000
```

Le service Spring Boot appelle ce microservice pour les prédictions.
Si le service ML est indisponible, Spring Boot utilise un fallback basé sur des règles heuristiques (if/else).

## Prérequis

- Python 3.10+
- Pip

## Installation

```bash
cd ml-service
pip install -r requirements.txt
```

## Démarrage

```bash
python main.py
```

Le service démarre sur `http://localhost:8000`.

Au premier démarrage, le modèle XGBoost s'entraîne automatiquement sur 2000 données
synthétiques. Le modèle est ensuite sauvegardé dans `models/xgboost_turnover.pkl`
et rechargé automatiquement aux démarrages suivants.

## Endpoints

### GET /health
État du service et du modèle.

```json
{
  "status": "healthy",
  "modelLoaded": true,
  "modelVersion": "20260525_142300",
  "accuracy": 0.9425,
  "uptime": "5 minutes",
  "nPredictions": 42
}
```

### GET /model
Informations détaillées du modèle XGBoost.

```json
{
  "loaded": true,
  "version": "20260525_142300",
  "nFeatures": 8,
  "featureNames": ["age","anciennete_mois","salaire","genre","nb_absences_3mois","nb_retards_1mois","nb_conges_12mois","statut_actif"],
  "accuracy": 0.9425
}
```

### POST /train
(Ré)entraîne le modèle XGBoost.

**Paramètre :** `?n_synthetique=2000` (nombre de données synthétiques)

```json
{
  "status": "success",
  "nSamples": 2000,
  "accuracy": 0.9425,
  "featureImportance": [
    {"feature": "anciennete_mois", "importance": 0.34},
    {"feature": "statut_actif", "importance": 0.18},
    ...
  ]
}
```

### POST /predict
Prédiction individuelle de turnover.

**Corps de la requête :**
```json
{
  "employe": {
    "employeId": 1,
    "nom": "Admin",
    "prenom": "Systeme",
    "age": 40,
    "ancienneteMois": 196,
    "salaire": 2000000,
    "genre": 0,
    "nbAbsences3Mois": 0,
    "nbRetards1Mois": 0,
    "nbConges12Mois": 2,
    "statutActif": 1
  }
}
```

**Réponse :**
```json
{
  "employeId": 1,
  "scoreRisque": 0.0018,
  "niveau": "FAIBLE",
  "probabilite": 0.0018,
  "facteursRisque": ["Anciennete elevee (196 mois) +15%"],
  "recommandation": "Situation stable : aucune action urgente.",
  "featuresImportance": [
    {"feature": "anciennete_mois", "importance": 0.34},
    ...
  ]
}
```

### POST /predict/batch
Prédiction pour plusieurs employés.

**Corps :** `{ "employes": [ { ... }, { ... } ] }`

## Features utilisées (8)

| Feature | Description | Plage | Poids dans le modèle |
|---------|-------------|-------|---------------------|
| `anciennete_mois` | Ancienneté en mois | 0-360 | **34%** |
| `statut_actif` | 1=Actif, 0=Inactif | 0-1 | **18%** |
| `nb_absences_3mois` | Absences sur 3 mois | 0-15 | **11%** |
| `nb_conges_12mois` | Congés sur 12 mois | 0-10 | **11%** |
| `age` | Âge en années | 18-65 | **7%** |
| `salaire` | Salaire mensuel | 200k-3M | **7%** |
| `nb_retards_1mois` | Retards sur 1 mois | 0-8 | **7%** |
| `genre` | 0=Homme, 1=Femme | 0-1 | **6%** |

## Niveaux de risque

- **CRITIQUE** (≥ 0.75) : Action immédiate sous 48h
- **ÉLEVÉ** (≥ 0.50) : Plan d'action sous 2 semaines
- **MOYEN** (≥ 0.25) : Surveillance trimestrielle
- **FAIBLE** (< 0.25) : Situation stable

## Fallback (règles heuristiques)

Si le service ML Python est indisponible, le backend Spring Boot utilise
automatiquement un calcul basé sur des règles if/else :

- Ancienneté < 1 an → +30%
- Ancienneté > 10 ans → +15%
- Absences > 5/3 mois → +25%
- Congés > 4/12 mois → +15%
- Retards > 4/1 mois → +15%
- Salaire < 400k → +10%
- Âge < 25 ans → +8%
- Statut inactif → +20%

Ce fallback est transparent pour le frontend. Le champ `mlActif: false`
dans la réponse indique que la prédiction vient du fallback.

## Intégration Spring Boot

Le service est appelé depuis `MlPredictionService.java` via `RestTemplate`.
Configuration de l'URL dans `application.properties` :

```properties
ml.service.url=http://localhost:8000
```

## Structure du projet

```
ml-service/
├── main.py                        # Application FastAPI
├── requirements.txt               # Dépendances Python
├── schemas/
│   └── schemas.py                 # Modèles Pydantic
├── services/
│   ├── data_service.py            # Génération données synthétiques + features
│   └── prediction_service.py      # XGBoost (entraînement, prédiction, fallback)
└── models/
    ├── xgboost_turnover.pkl       # Modèle entraîné
    └── model_info.json            # Métadonnées du modèle
```
