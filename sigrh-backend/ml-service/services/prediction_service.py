import os
import json
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from typing import List, Optional, Tuple
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import xgboost as xgb

from services.data_service import (
    FEATURE_NAMES,
    generer_donnees_synthetiques,
    preparer_features,
    analyser_facteurs_risque,
    get_recommandation,
    get_niveau,
)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_turnover.pkl")
MODEL_INFO_PATH = os.path.join(MODEL_DIR, "model_info.json")


class TurnoverPredictor:

    def __init__(self):
        self.model: Optional[xgb.XGBClassifier] = None
        self.model_info: dict = {
            "loaded": False,
            "version": None,
            "nFeatures": len(FEATURE_NAMES),
            "featureNames": FEATURE_NAMES,
            "accuracy": None,
            "trainedAt": None,
            "nSamples": None,
        }
        self.n_predictions = 0
        self._charger_modele()

    def _charger_modele(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
                if os.path.exists(MODEL_INFO_PATH):
                    with open(MODEL_INFO_PATH, "r") as f:
                        self.model_info = json.load(f)
                self.model_info["loaded"] = True
                print(f"Modele charge: {MODEL_PATH}")
            else:
                print("Aucun modele trouve, entrainement auto necessaire")
        except Exception as e:
            print(f"Erreur chargement modele: {e}")

    def _sauvegarder_modele(self):
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        with open(MODEL_INFO_PATH, "w") as f:
            json.dump(self.model_info, f, indent=2, default=str)
        print(f"Modele sauvegarde: {MODEL_PATH}")

    def entrainer(
        self,
        X: Optional[np.ndarray] = None,
        y: Optional[np.ndarray] = None,
        params: Optional[dict] = None,
        n_synthetique: int = 2000,
    ) -> dict:
        if X is None or y is None:
            print(f"Generation de {n_synthetique} donnees synthetiques...")
            df = generer_donnees_synthetiques(n_synthetique)
            X = df[FEATURE_NAMES].values
            y = df["label"].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        default_params = {
            "n_estimators": 200,
            "max_depth": 6,
            "learning_rate": 0.08,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "min_child_weight": 3,
            "gamma": 0.1,
            "reg_alpha": 0.1,
            "reg_lambda": 1.0,
            "scale_pos_weight": (y_train == 0).sum() / (y_train == 1).sum(),
            "random_state": 42,
            "eval_metric": "auc",
            "use_label_encoder": False,
        }
        if params:
            default_params.update(params)

        self.model = xgb.XGBClassifier(**default_params)
        print("Entrainement XGBoost en cours...")
        self.model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

        y_pred = self.model.predict(X_test)
        y_proba = self.model.predict_proba(X_test)[:, 1]
        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_proba)
        print(f"Precision: {accuracy:.4f} | AUC: {auc:.4f}")

        importance = self.model.feature_importances_
        feature_importance = [
            {"feature": FEATURE_NAMES[i], "importance": round(float(importance[i]), 4)}
            for i in range(len(FEATURE_NAMES))
        ]
        feature_importance.sort(key=lambda x: x["importance"], reverse=True)

        version = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.model_info = {
            "loaded": True,
            "version": version,
            "nFeatures": len(FEATURE_NAMES),
            "featureNames": FEATURE_NAMES,
            "accuracy": round(float(accuracy), 4),
            "auc": round(float(auc), 4),
            "trainedAt": datetime.now().isoformat(),
            "nSamples": int(len(X)),
            "testSamples": int(len(X_test)),
            "params": default_params,
            "featureImportance": feature_importance,
        }
        self._sauvegarder_modele()
        return {
            "status": "success",
            "nSamples": int(len(X)),
            "nFeatures": len(FEATURE_NAMES),
            "accuracy": round(float(accuracy), 4),
            "auc": round(float(auc), 4),
            "featureImportance": feature_importance,
            "modelVersion": version,
        }

    def predire(self, employe_data: dict) -> dict:
        features = preparer_features(employe_data)
        employe_id = employe_data.get("employeId", 0)
        if self.model is not None:
            proba = float(self.model.predict_proba(features)[0, 1])
            score = round(proba, 4)
        else:
            score = self._calcul_heuristique(employe_data)
        self.n_predictions += 1
        niveau = get_niveau(score)
        facteurs = analyser_facteurs_risque(employe_data, score)
        recommandation = get_recommandation(niveau, score)
        importance = []
        if self.model is not None:
            feat_imp = self.model.feature_importances_
            for i, name in enumerate(FEATURE_NAMES):
                importance.append({"feature": name, "importance": round(float(feat_imp[i]), 4)})
            importance.sort(key=lambda x: x["importance"], reverse=True)
        return {
            "employeId": employe_id,
            "nom": employe_data.get("nom", ""),
            "prenom": employe_data.get("prenom", ""),
            "scoreRisque": score,
            "niveau": niveau,
            "probabilite": score,
            "facteursRisque": facteurs,
            "recommandation": recommandation,
            "featuresImportance": importance,
        }

    def predire_batch(self, employes_data: List[dict]) -> List[dict]:
        return [self.predire(emp) for emp in employes_data]

    def _calcul_heuristique(self, data: dict) -> float:
        score = 0.0
        anciennete = data.get("ancienneteMois", 12)
        if anciennete < 12:
            score += 0.30
        elif anciennete > 120:
            score += 0.15
        absences = data.get("nbAbsences3Mois", 0)
        if absences > 5:
            score += 0.25
        elif absences > 2:
            score += 0.10
        conges = data.get("nbConges12Mois", 0)
        if conges > 4:
            score += 0.15
        retards = data.get("nbRetards1Mois", 0)
        if retards > 4:
            score += 0.15
        salaire = data.get("salaire", 0)
        if salaire < 400000:
            score += 0.10
        age = data.get("age", 30)
        if age < 25:
            score += 0.08
        if data.get("statutActif", 1) == 0:
            score += 0.20
        return round(min(score, 1.0), 4)

    def get_model_info(self) -> dict:
        info = dict(self.model_info)
        info["nPredictions"] = self.n_predictions
        return info


predictor = TurnoverPredictor()
