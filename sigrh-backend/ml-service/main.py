"""
API de prédiction de turnover RH - FastAPI + XGBoost.
Microservice ML pour SIGRH.

Endpoints:
    GET  /health          - État du service
    GET  /model           - Infos du modèle
    POST /train           - Entraînement du modèle
    POST /predict         - Prédiction individuelle
    POST /predict/batch   - Prédiction par lot
"""

import time
from datetime import datetime
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas.schemas import (
    PredictionRequest,
    BatchPredictionRequest,
    PredictionResult,
    TrainResponse,
    HealthResponse,
    ModelInfo,
)
from services.prediction_service import predictor

# ─── Application ────────────────────────────────────

app = FastAPI(
    title="SIGRH - API de Prédiction ML",
    description="Microservice de prédiction de turnover basé sur XGBoost",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()


# ─── Endpoints Santé & Infos ────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Système"])
def health_check():
    """Vérifie l'état du service ML."""
    info = predictor.get_model_info()
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        modelLoaded=bool(predictor.model is not None),
        modelVersion=info.get("version"),
        uptime=f"{int((time.time() - START_TIME) / 60)} minutes",
        nPredictions=predictor.n_predictions,
    )


@app.get("/model", response_model=ModelInfo, tags=["Système"])
def model_info():
    """Retourne les informations détaillées du modèle XGBoost."""
    info = predictor.get_model_info()
    return ModelInfo(
        loaded=info.get("loaded", False),
        version=info.get("version"),
        nFeatures=info.get("nFeatures"),
        featureNames=info.get("featureNames", []),
        accuracy=info.get("accuracy"),
        trainedAt=info.get("trainedAt"),
        nSamples=info.get("nSamples"),
    )


# ─── Entraînement ───────────────────────────────────

@app.post("/train", response_model=TrainResponse, tags=["Modèle"])
def train_model(n_synthetique: int = 2000):
    """
    Entraîne le modèle XGBoost.
    Par défaut, génère des données synthétiques.
    """
    try:
        result = predictor.entrainer(n_synthetique=n_synthetique)
        return TrainResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Prédiction Individuelle ────────────────────────

@app.post("/predict", response_model=PredictionResult, tags=["Prédiction"])
def predict_individual(request: PredictionRequest):
    """
    Prédit le risque de turnover pour un employé.
    Utilise XGBoost si disponible, sinon calcul heuristique.
    """
    try:
        data = request.employe.model_dump()
        result = predictor.predire(data)
        return PredictionResult(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Prédiction par Lot ─────────────────────────────

@app.post("/predict/batch", response_model=List[PredictionResult], tags=["Prédiction"])
def predict_batch(request: BatchPredictionRequest):
    """
    Prédit le risque de turnover pour plusieurs employés.
    Retourne les scores, niveaux et facteurs de risque.
    """
    try:
        employes_data = [emp.model_dump() for emp in request.employes]
        results = predictor.predire_batch(employes_data)
        return [PredictionResult(**r) for r in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Démarrage ──────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("[ML] Demarrage du service ML SIGRH...")
    print(f"[ML] Features: {predictor.model_info['featureNames']}")
    if predictor.model is None:
        print("[ML] Entrainement initial sur donnees synthetiques...")
        result = predictor.entrainer(n_synthetique=2000)
        print(f"[ML] Modele entraine - Precision: {result['accuracy']:.4f}")
    uvicorn.run(app, host="0.0.0.0", port=8000)
