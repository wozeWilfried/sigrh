"""
Service de génération et préparation des données pour l'entraînement XGBoost.
Produit des données synthétiques réalistes basées sur les normes RH.
"""

import numpy as np
import pandas as pd
from datetime import datetime
from typing import List, Tuple


# Features utilisées par le modèle
FEATURE_NAMES = [
    "age",
    "anciennete_mois",
    "salaire",
    "genre",
    "nb_absences_3mois",
    "nb_retards_1mois",
    "nb_conges_12mois",
    "statut_actif",
]

# Poids réels des features (basés sur études RH)
FEATURE_WEIGHTS = {
    "anciennete_mois": 0.25,    # < 1 an ou > 10 ans → risque
    "nb_absences_3mois": 0.20,  # Absences fréquentes → risque
    "nb_conges_12mois": 0.18,   # Congés excessifs → risque
    "salaire": 0.15,            # Sous-payé → risque
    "age": 0.10,                 # Jeune → risque
    "nb_retards_1mois": 0.07,   # Retards → risque
    "statut_actif": 0.03,       # Inactif → risque
    "genre": 0.02,              # Impact faible
}


def generer_donnees_synthetiques(n_employes: int = 2000) -> pd.DataFrame:
    """
    Génère un dataset synthétique réaliste pour l'entraînement.
    
    Distributions:
    - Âge: 18-65 ans (normale centrée sur 35)
    - Ancienneté: 0-360 mois (exponentielle)
    - Salaire: 200k-3000k (log-normale)
    - Absences: 0-15 (Poisson)
    - Congés: 0-10 (Poisson)
    - Retards: 0-8 (Poisson)
    """
    np.random.seed(42)

    df = pd.DataFrame({
        "age": np.clip(np.random.normal(35, 10, n_employes).astype(int), 18, 65),
        "anciennete_mois": np.random.exponential(36, n_employes).astype(int).clip(0, 360),
        "salaire": np.clip(np.random.lognormal(13.8, 0.5, n_employes), 200000, 3000000),
        "genre": np.random.choice([0, 1], n_employes, p=[0.55, 0.45]),
        "nb_absences_3mois": np.random.poisson(1.5, n_employes).clip(0, 15),
        "nb_retards_1mois": np.random.poisson(0.8, n_employes).clip(0, 8),
        "nb_conges_12mois": np.random.poisson(2, n_employes).clip(0, 10),
        "statut_actif": np.random.choice([0, 1], n_employes, p=[0.05, 0.95]),
    })

    # Calcul du risque réel basé sur les poids
    risque = (
        (df["anciennete_mois"] < 12).astype(float) * 0.30 +
        (df["anciennete_mois"] > 120).astype(float) * 0.15 +
        (df["nb_absences_3mois"] > 5).astype(float) * 0.25 +
        (df["nb_absences_3mois"].between(3, 5)).astype(float) * 0.10 +
        (df["nb_conges_12mois"] > 4).astype(float) * 0.15 +
        (df["salaire"] < 400000).astype(float) * 0.10 +
        (df["age"] < 25).astype(float) * 0.08 +
        (df["statut_actif"] == 0).astype(float) * 0.20 +
        np.random.normal(0, 0.05, n_employes)  # Bruit
    )
    risque = risque.clip(0, 1)

    # Label binaire: turnover si risque > seuil
    label = (risque > np.random.uniform(0.3, 0.7, n_employes)).astype(float)

    df["risque"] = risque
    df["label"] = label

    return df


def preparer_features(employe_data: dict) -> np.ndarray:
    """
    Convertit les données d'un employé en vecteur de features.
    """
    features = [
        float(employe_data.get("age", 30)),
        float(employe_data.get("ancienneteMois", 12)),
        float(employe_data.get("salaire", 500000)),
        float(employe_data.get("genre", 0)),
        float(employe_data.get("nbAbsences3Mois", 0)),
        float(employe_data.get("nbRetards1Mois", 0)),
        float(employe_data.get("nbConges12Mois", 0)),
        float(employe_data.get("statutActif", 1)),
    ]
    return np.array(features).reshape(1, -1)


def analyser_facteurs_risque(employe_data: dict, score: float) -> List[str]:
    """
    Analyse les facteurs de risque pour un employé.
    Retourne une liste de facteurs expliquant le score.
    """
    facteurs = []

    anciennete = employe_data.get("ancienneteMois", 0)
    if anciennete < 12:
        facteurs.append(f"Ancienneté faible ({anciennete} mois) +30%")
    elif anciennete > 120:
        facteurs.append(f"Ancienneté élevée ({anciennete} mois) +15%")

    absences = employe_data.get("nbAbsences3Mois", 0)
    if absences > 5:
        facteurs.append(f"Absences fréquentes ({absences}/3 mois) +25%")
    elif absences > 2:
        facteurs.append(f"Absences modérées ({absences}/3 mois) +10%")

    conges = employe_data.get("nbConges12Mois", 0)
    if conges > 4:
        facteurs.append(f"Congés fréquents ({conges}/12 mois) +15%")

    retards = employe_data.get("nbRetards1Mois", 0)
    if retards > 4:
        facteurs.append(f"Retards fréquents ({retards}/1 mois) +15%")

    salaire = employe_data.get("salaire", 0)
    if salaire < 400000:
        facteurs.append(f"Salaire bas ({salaire:,.0f} FCFA) +10%")

    age = employe_data.get("age", 0)
    if age < 25:
        facteurs.append(f"Age jeune ({age} ans) +8%")
    elif age > 55:
        facteurs.append(f"Age avancé ({age} ans) +5%")

    if employe_data.get("statutActif", 1) == 0:
        facteurs.append("Statut inactif/suspendu +20%")

    if not facteurs:
        facteurs.append("Profil stable, aucun facteur de risque majeur")

    return facteurs


def get_recommandation(niveau: str, score: float) -> str:
    """Génère une recommandation basée sur le niveau de risque."""
    recommandations = {
        "CRITIQUE": (
            "CRITIQUE - Action immediate requise : "
            "Entretien RH d'urgence sous 48h. "
            "Evaluer les conditions de travail, charge excessive ou conflits. "
            "Envisager prime de retention ou reorganisation."
        ),
        "ELEVE": (
            "ELEVE - Plan d'action sous 2 semaines : "
            "Entretien individuel approfondi. "
            "Verifier satisfaction, perspective d'evolution et equilibre vie pro/perso. "
            "Proposer formation ou mobilite interne."
        ),
        "MOYEN": (
            "MOYEN - Surveillance trimestrielle : "
            "Point mensuel recommande. "
            "Suivre l'evolution des absences et conges. "
            "Maintenir un dialogue ouvert."
        ),
        "FAIBLE": (
            "🟢 Situation stable : "
            "Aucune action urgente. "
            "Continuer le suivi RH standard. "
            "Encourager le développement professionnel."
        ),
    }
    return recommandations.get(niveau, "Suivi standard recommandé.")


def get_niveau(score: float) -> str:
    """Convertit un score en niveau de risque."""
    if score >= 0.75:
        return "CRITIQUE"
    elif score >= 0.50:
        return "ELEVE"
    elif score >= 0.25:
        return "MOYEN"
    return "FAIBLE"
