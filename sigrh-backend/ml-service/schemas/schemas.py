from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class EmployeData(BaseModel):
    """Données d'un employé pour la prédiction"""
    employeId: int
    nom: str = ""
    prenom: str = ""
    poste: str = ""
    departement: str = ""

    # Features numériques
    age: int = Field(ge=18, le=70, description="Âge en années")
    ancienneteMois: int = Field(ge=0, description="Ancienneté en mois")
    salaire: float = Field(ge=0, description="Salaire mensuel")
    genre: int = Field(0, ge=0, le=1, description="0=Masculin, 1=Féminin")

    # Features comportementales
    nbAbsences3Mois: int = Field(0, ge=0, description="Nombre d'absences sur 3 mois")
    nbRetards1Mois: int = Field(0, ge=0, description="Nombre de retards sur 1 mois")
    nbConges12Mois: int = Field(0, ge=0, description="Nombre de congés sur 12 mois")
    statutActif: int = Field(1, ge=0, le=1, description="1=Actif, 0=Suspendu/Inactif")


class PredictionRequest(BaseModel):
    """Requête de prédiction pour un employé"""
    employe: EmployeData


class BatchPredictionRequest(BaseModel):
    """Requête de prédiction pour plusieurs employés"""
    employes: List[EmployeData]


class FeatureImportance(BaseModel):
    """Importance d'une feature dans le modèle"""
    feature: str
    importance: float


class PredictionResult(BaseModel):
    """Résultat de prédiction pour un employé"""
    employeId: int
    nom: str = ""
    prenom: str = ""
    scoreRisque: float = Field(..., ge=0, le=1, description="Score de risque entre 0 et 1")
    niveau: str = ""  # FAIBLE, MOYEN, ELEVE, CRITIQUE
    probabilite: float = Field(..., ge=0, le=1, description="Probabilité de départ")
    facteursRisque: List[str] = []
    recommandation: str = ""
    featuresImportance: List[FeatureImportance] = []


class TrainingDataPoint(BaseModel):
    """Point de données pour l'entraînement"""
    features: List[float]
    label: float = Field(..., ge=0, le=1, description="0=Resté, 1=Parti")


class TrainRequest(BaseModel):
    """Requête d'entraînement du modèle"""
    data: List[TrainingDataPoint]
    params: Optional[dict] = None


class TrainResponse(BaseModel):
    """Réponse après entraînement"""
    status: str
    nSamples: int
    nFeatures: int
    accuracy: float
    featureImportance: List[FeatureImportance]
    modelVersion: str


class HealthResponse(BaseModel):
    """Réponse de santé du service"""
    status: str
    version: str
    modelLoaded: bool
    modelVersion: Optional[str] = None
    uptime: str
    nPredictions: int


class ModelInfo(BaseModel):
    """Informations sur le modèle chargé"""
    loaded: bool
    version: Optional[str] = None
    nFeatures: Optional[int] = None
    featureNames: List[str] = []
    accuracy: Optional[float] = None
    trainedAt: Optional[str] = None
    nSamples: Optional[int] = None
