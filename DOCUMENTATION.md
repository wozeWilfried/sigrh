# SIGRH — Système Intégré de Gestion des Ressources Humaines

**Version 2.5.0**

---

## Sommaire

1. [Présentation générale](#1-présentation-générale)
2. [Architecture technique](#2-architecture-technique)
3. [Stack technologique](#3-stack-technologique)
4. [Modules fonctionnels](#4-modules-fonctionnels)
5. [Gestion des rôles et permissions](#5-gestion-des-rôles-et-permissions)
6. [Sécurité & Authentification](#6-sécurité--authentification)
7. [Flux de création d'un employé](#7-flux-de-création-dun-employé)
8. [API REST — Référence complète](#8-api-rest--référence-complète)
9. [Installation & Déploiement](#9-installation--déploiement)
10. [Annexes](#10-annexes)

---

## 1. Présentation générale

SIGRH est une solution web moderne de gestion des ressources humaines destinée aux entreprises et organisations. Elle centralise l'ensemble des processus RH :

- Gestion administrative des employés
- Suivi des présences et pointage
- Gestion des congés et absences
- Paie et fiches de paie
- Gestion du matériel et des équipements
- Suivi des contrats
- Rapports et exports (Excel, PDF)
- Alertes et analyse prédictive (turnover, absentéisme)
- Tableaux de bord décisionnels

L'application est conçue selon une architecture **client-serveur** avec un **backend Java Spring Boot** et un **frontend React**, communiquant via une **API REST sécurisée par JWT**.

---

## 2. Architecture technique

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR (Frontend)                       │
│              React 19 + Vite + Tailwind CSS                     │
│                        Port 5173                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ http://localhost:5173
                           │ Proxy Vite → http://localhost:8080/api
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API REST (Backend)                           │
│             Spring Boot 4.0.6 + Java 17                         │
│                        Port 8080                                │
├─────────────────┬───────────────────┬──────────────────────────┤
│  Controllers    │    Services        │    JPA Repositories      │
│  (REST)         │    (Métier)        │    (Data)                │
├─────────────────┴───────────────────┴──────────────────────────┤
│                      Sécurité JWT                               │
│           Spring Security + JWT Filter + BCrypt                 │
├────────────────────────────────────────────────────────────────┤
│                     Base de données                              │
│                    MySQL 8 (WAMP)                                │
│                    sigrh_db                                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Service ML (Python / FastAPI)                     │
│               Port 8000 (optionnel)                             │
│               Prédictions XGBoost                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Backend — Structure du projet

```
sigrh-backend/
├── src/main/java/com/sigrh/cwa/
│   ├── config/           → Configuration Spring (Security, CORS, Swagger, Cache)
│   ├── controller/       → Contrôleurs REST (15 endpoints)
│   ├── dto/              → Objets de transfert de données
│   ├── entity/           → Entités JPA (12 entités)
│   ├── enums/            → Énumérations (11 enums)
│   ├── exception/        → Gestion globale des erreurs
│   ├── repository/       → Accès aux données (JPA Repository)
│   ├── security/         → JWT, filtres, helpers
│   └── service/          → Logique métier (15 services)
├── src/main/resources/
│   └── application.properties
├── ml-service/           → Microservice Python ML (optionnel)
└── pom.xml
```

### 2.2 Frontend — Structure du projet

```
sigrh-frontend/
├── src/
│   ├── api/              → Appels API (14 modules)
│   ├── components/       → Composants réutilisables
│   │   ├── charts/       → Graphiques Recharts
│   │   ├── layout/       → AppLayout, Sidebar, Navbar
│   │   └── ui/           → Toast, Confirm, Loading
│   ├── context/          → AuthContext (état global)
│   ├── hooks/            → Custom hooks (10 hooks)
│   ├── pages/            → Pages par rôle
│   │   ├── admin/        → Dashboard RH, employés, congés, paie, etc.
│   │   ├── employee/     → Dashboard & demandes employé
│   │   ├── manager/      → Dashboard & gestion manager
│   │   ├── rh/           → Dashboard RH
│   │   └── secretary/    → Saisie présences secrétaire
│   ├── routes/           → Routeur React
│   └── utils/            → Utilitaires
├── index.html
├── vite.config.js
└── package.json
```

---

## 3. Stack technologique

### 3.1 Backend

| Technologie | Version | Usage |
|---|---|---|
| Java | 17 | Langage principal |
| Spring Boot | 4.0.6 | Framework applicatif |
| Spring Security | — | Authentification & autorisation |
| Spring Data JPA | — | Accès base de données |
| Spring Mail | — | Envoi d'emails SMTP |
| MySQL | 8.x | Base de données |
| JWT (jjwt) | 0.11.5 | Jetons d'authentification |
| Lombok | — | Réduction de code |
| ModelMapper | 3.1.1 | Mapping DTO/Entité |
| Apache POI | 5.2.3 | Export Excel (.xlsx) |
| iText 7 | 7.2.5 | Génération PDF |
| Swagger/OpenAPI | 3.0.3 | Documentation API |
| Caffeine | — | Cache mémoire |
| H2 | — | Base de test |

### 3.2 Frontend

| Technologie | Version | Usage |
|---|---|---|
| React | 19.2.6 | Framework UI |
| Vite | 8.0.14 | Bundler & dev server |
| React Router | 7.15.1 | Routage SPA |
| Axios | 1.16.1 | Client HTTP |
| Tailwind CSS | 4.3.0 | Styles utilitaires |
| Framer Motion | 12.40.0 | Animations |
| Recharts | 3.8.1 | Graphiques |
| Lucide React | 1.16.0 | Icônes |
| clsx | 2.1.1 | Classes conditionnelles |
| tailwind-merge | 3.6.0 | Fusion de classes |

### 3.3 ML (optionnel)

| Technologie | Usage |
|---|---|
| Python 3 | Langage |
| FastAPI | API microservice |
| XGBoost | Modèle prédictif |
| Scikit-learn | Préparation données |

---

## 4. Modules fonctionnels

### 4.1 Gestion des employés

- **Création** d'un employé avec génération automatique :
  - Matricule unique
  - Identifiant de connexion (username)
  - Mot de passe temporaire (12 caractères, sécurisé)
  - Envoi des identifiants par email
- **Modification** des informations (état civil, poste, salaire, département)
- **Gestion des statuts** : ACTIF, INACTIF, SUSPENDU, EN_CONGE, DEPART (avec machine à états validant les transitions)
- **Recherche** multicritères avec pagination
- **Profil employé** avec photo, soldes de congés, historique
- **Première connexion** : redirection forcée vers la page de changement de mot de passe

### 4.2 Gestion des départements

- CRUD complet des départements
- Responsable de département
- Statistiques par département (effectif, salaire moyen)

### 4.3 Gestion des congés

- Cinq types de congés : **Annuel**, **Maladie**, **Maternité**, **Sans solde**, **Exceptionnel**
- Calcul automatique du nombre de jours (tous les jours calendaires inclus)
- Validation du solde disponible avant création
- Détection des chevauchements de périodes
- Workflow de validation : création → EN_ATTENTE → APPROUVE / REFUSE
- **Solde annuel** : 30 jours ouvrables par an, report maximal de 5 jours
- Prise en compte de l'ancienneté et prorata pour les nouvelles recrues
- Soldes affichés : Disponible, Acquis, Consommés, En attente

### 4.4 Gestion des présences

- Pointage quotidien (PRESENT, ABSENT, RETARD, CONGE)
- Historique et filtres par période
- Statistiques : taux de présence, absentéisme par département
- Rapports mensuels individuels
- Cache Caffeine (15 min) pour les statistiques

### 4.5 Paie

- Génération de fiches de paie
- Calcul des cotisations CNPS (4,2%)
- Calcul de l'IRPP (barème progressif)
- Validation des fiches de paie
- Masse salariale et prévisions

### 4.6 Gestion du matériel

- Catégories de matériel
- Suivi des équipements (statuts : DISPONIBLE, ASSIGNE, EN_MAINTENANCE, HORS_SERVICE)
- Attribution aux employés avec historique
- Gestion des retours

### 4.7 Contrats

- Types : CDI, CDD, STAGE, PRESTATION, ALTERNANCE
- Cycle de vie complet : création → ACTIF → TERMINE / RESILIE
- Suivi par employé

### 4.8 Alertes RH

- Détection automatique des situations à risque :
  - Turnover potentiel
  - Absentéisme excessif
  - Congés excessifs
  - Salaires anormaux
  - Retards fréquents
- Niveaux : FAIBLE, MOYEN, ELEVE, CRITIQUE
- Génération manuelle et automatique
- Marquage comme traitées

### 4.9 Analyse prédictive & IA

- **Prédiction de turnover** par employé (score 0.0 à 1.0)
- **Analyse d'absentéisme** par département
- **Prévision de masse salariale** (projection 6 mois)
- **Tendance des congés** (12 mois)
- **Dashboard prédictif** complet
- Intégration avec microservice **Python + XGBoost** (avec fallback heuristique)

### 4.10 Exports & Rapports

- **Excel** (Apache POI) : employés, congés, présences, paie, contrats
- **PDF** (iText 7) : employés, congés, présences, paie, contrats
- **Rapport RH global** : multi-feillets (employés + présences + congés)

### 4.11 Tableaux de bord

- **Admin RH** : KPI, effectifs, répartition genre, pyramide âges, départements, salaires, absentéisme, congés, présences, matériel, alertes, turnover
- **Manager** : KPI département, congés en attente, équipe
- **Employé** : soldes personnels, demandes en attente, historique
- **RH** : vue synthétique
- **Secrétaire** : saisie des présences

### 4.12 Recherche globale

- Recherche multicritères unifiée : employés, départements, congés, présences, paie, matériel

---

## 5. Gestion des rôles et permissions

### 5.1 Hiérarchie des rôles

| Rôle | Accès |
|---|---|
| **ADMIN** | Administrateur RH — Accès complet à toutes les fonctionnalités |
| **RH** | Responsable RH — Accès à la gestion RH, dashboard, alertes, exports |
| **MANAGER** | Manager — Accès aux employés de son département, congés, présences, matériel, prédictions IA |
| **SECRETAIRE** | Secrétaire — Saisie des présences, consultation historique |
| **EMPLOYE** | Employé — Dashboard personnel, demande de congés |

### 5.2 Périmètres d'accès

Pour chaque rôle, les accès sont filtrés au niveau service :

- **ADMIN / RH** : accès à toutes les données
- **MANAGER** : accès limité aux employés de son département (via `departementId`)
- **EMPLOYE** : accès limité à ses propres données
- **SECRETAIRE** : accès aux présences

### 5.3 Sécurité des endpoints

L'authentification est vérifiée à deux niveaux :

1. **URL-based** (`SecurityConfig.java`) : règles globales par pattern d'URL
2. **Service-based** (`SecurityHelper.java`) : vérifications fines dans la couche métier

---

## 6. Sécurité & Authentification

### 6.1 Mécanisme JWT

```
Connexion → POST /api/auth/login
  ├─ username / password
  └─ Réponse : { token (30min), refreshToken (7j), role, employeId, firstLogin }

Requêtes authentifiées → Header: Authorization: Bearer <token>

/!\ Refresh automatique → Intercepteur Axios
    Si 401 détecté → POST /api/auth/refresh → nouveaux tokens
    Si refresh échoue → déconnexion forcée
```

### 6.2 Flux d'authentification

1. **Login** : identification par username/password, génération de deux jetons JWT
2. **Validation** : chaque requête est filtrée par `JwtFilter` (vérification signature, blacklist, type "access")
3. **Refresh** : rotation des jetons avec blacklist de l'ancien refresh token
4. **Logout** : blacklisting explicite des jetons
5. **Changement de mot de passe** : validation du mot de passe courant (sauf si `firstLogin=true`)

### 6.3 Sécurité des mots de passe

- Stockage en base : **BCrypt** (Spring Security)
- Génération des mots de passe temporaires : **SecureRandom**, 12 caractères (maj + min + chiffre + symbole)
- Première connexion : flag `firstLogin=true`, changement forcé

### 6.4 Protection CSRF / CORS

- **CSRF** : désactivé (API stateless)
- **CORS** : origine unique configurée (`http://localhost:5173`)
- **Session** : STATELESS (pas de session HTTP)

---

## 7. Flux de création d'un employé

```
1. Admin remplit le formulaire → POST /api/employes
2. Backend :
   ├─ Crée l'employé en base (matricule auto-généré)
   ├─ Crée le compte utilisateur (username basé sur le nom)
   ├─ Génère un mot de passe temporaire sécurisé
   ├─ Envoie un email SMTP avec identifiants (thread asynchrone)
   └─ Retourne la réponse (avec mot de passe dans le toast)
3. L'employé reçoit l'email avec :
   ├─ Identifiant (username)
   └─ Mot de passe temporaire
4. Première connexion :
   ├─ Redirection automatique vers /employees/{id}
   ├─ Bannière de changement de mot de passe
   └─ Changement validé → firstLogin = false
```

---

## 8. API REST — Référence complète

### 8.1 Authentification — `/api/auth`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| POST | `/api/auth/login` | Connexion | Public |
| POST | `/api/auth/refresh` | Rafraîchir les jetons | Public |
| POST | `/api/auth/logout` | Déconnexion | Public |
| POST | `/api/auth/change-password` | Changer le mot de passe | Authentifié |

### 8.2 Employés — `/api/employes`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/employes` | Liste paginée | Admin/RH/Manager |
| GET | `/api/employes/search?q=` | Recherche | Admin/RH |
| GET | `/api/employes/{id}` | Détail | Selon permissions |
| POST | `/api/employes` | Créer employé (+ compte) | Admin/RH |
| PUT | `/api/employes/{id}` | Modifier employé | Admin/RH |
| PATCH | `/api/employes/{id}/status` | Changer statut | Admin/RH |
| DELETE | `/api/employes/{id}` | Supprimer | Admin |

### 8.3 Congés — `/api/conges`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/conges` | Liste (filtrée par rôle) | Authentifié |
| GET | `/api/conges?statut=` | Filtrer par statut | Authentifié |
| POST | `/api/conges` | Créer demande | Authentifié |
| PUT | `/api/conges/{id}/valider` | Approuver/Refuser | Admin/RH/Manager |
| DELETE | `/api/conges/{id}` | Supprimer | Authentifié |
| GET | `/api/conges/solde/{employeId}` | Solde de congés | Selon permissions |

### 8.4 Présences — `/api/presences`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/presences` | Liste (filtrée) | Authentifié |
| GET | `/api/presences/employe/{id}` | Présences employé | Selon permissions |
| GET | `/api/presences/historique` | Historique complet | Admin/RH/Manager |
| GET | `/api/presences/stats` | Statistiques | Admin/RH/Manager |
| POST | `/api/presences` | Pointer présence | Authentifié |
| GET | `/api/presences/rapport/{id}` | Rapport mensuel | Selon permissions |

### 8.5 Paie — `/api/paie`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/paie` | Liste fiches | Authentifié |
| POST | `/api/paie/generer` | Générer fiche | Admin/RH |
| PUT | `/api/paie/{id}/valider` | Valider fiche | Admin/RH |

### 8.6 Départements — `/api/departements`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/departements` | Liste | Admin/RH/Manager |
| POST | `/api/departements` | Créer | Admin |
| PUT | `/api/departements/{id}` | Modifier | Admin |
| DELETE | `/api/departements/{id}` | Supprimer | Admin |

### 8.7 Contrats — `/api/contrats`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/contrats` | Liste | Admin/RH/Secretaire |
| GET | `/api/contrats/{id}` | Détail | Admin/RH/Secretaire |
| POST | `/api/contrats` | Créer | Admin/RH/Secretaire |
| PUT | `/api/contrats/{id}` | Modifier | Admin/RH/Secretaire |
| DELETE | `/api/contrats/{id}` | Supprimer | Admin/RH/Secretaire |
| PUT | `/api/contrats/{id}/terminer` | Terminer | Admin/RH/Secretaire |
| GET | `/api/contrats/stats` | Statistiques | Admin/RH |

### 8.8 Matériel — `/api/materiel`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/materiel` | Liste équipements | Admin/RH/Secretaire/Manager |
| POST | `/api/materiel` | Créer équipement | Admin/RH/Secretaire |
| PUT | `/api/materiel/{id}` | Modifier | Admin/RH/Secretaire |
| DELETE | `/api/materiel/{id}` | Supprimer | Admin/RH/Secretaire |
| GET | `/api/materiel/stats` | Statistiques | Admin/RH |
| POST | `/api/materiel/{id}/attribuer` | Attribuer employé | Admin/RH/Secretaire |
| PUT | `/api/materiel/{id}/retourner` | Retour matériel | Admin/RH/Secretaire |
| GET | `/api/materiel/categories` | Catégories | Admin/RH/Secretaire/Manager |
| GET | `/api/materiel/attributions` | Attributions | Admin/RH/Secretaire/Manager |

### 8.9 Dashboard — `/api/dashboard`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/dashboard` | Dashboard complet | Admin/RH |
| GET | `/api/dashboard/kpis` | Indicateurs clés | Admin/RH/Secretaire/Manager |
| GET | `/api/dashboard/evolution` | Évolution mensuelle | Admin/RH/Secretaire/Manager |
| GET | `/api/dashboard/recent-leaves` | Derniers congés | Admin/RH/Secretaire/Manager |
| GET | `/api/dashboard/recent-alerts` | Dernières alertes | Admin/RH/Secretaire/Manager |

### 8.10 Analyse prédictive — `/api/analyse`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/analyse/dashboard-predictif` | Dashboard prédictif | Admin/RH |
| GET | `/api/analyse/turnover` | Analyse turnover | Admin/RH/Manager |
| GET | `/api/analyse/turnover/{id}` | Turnover employé | Admin/RH/Manager |
| GET | `/api/analyse/absenteisme` | Absentéisme | Admin/RH |
| GET | `/api/analyse/tendance-conges` | Tendance congés | Admin/RH |
| GET | `/api/analyse/alertes` | Alertes | Admin/RH/Manager |
| PUT | `/api/analyse/alertes/{id}/traiter` | Traiter alerte | Admin/RH |

### 8.11 Alertes RH — `/api/alertes`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/alertes` | Liste filtrée | Admin/RH/Manager |
| GET | `/api/alertes/count` | Compteur | Admin/RH/Manager |
| PUT | `/api/alertes/{id}/traiter` | Traiter | Admin/RH |
| PUT | `/api/alertes/traiter-tout` | Tout traiter | Admin/RH |

### 8.12 Recherche — `/api/search`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/search?q=&type=` | Recherche globale | Admin/RH/Secretaire/Manager |

### 8.13 Exports — `/api/export`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/export/employes/excel` | Export Excel employés | Admin/RH/Secretaire |
| GET | `/api/export/employes/pdf` | Export PDF employés | Admin/RH/Secretaire |
| GET | `/api/export/conges/excel` | Export Excel congés | Admin/RH/Secretaire |
| GET | `/api/export/conges/pdf` | Export PDF congés | Admin/RH/Secretaire |
| GET | `/api/export/presences/excel` | Export Excel présences | Admin/RH/Secretaire |
| GET | `/api/export/presences/pdf` | Export PDF présences | Admin/RH/Secretaire |
| GET | `/api/export/paie/excel` | Export Excel paie | Admin/RH/Secretaire |
| GET | `/api/export/paie/pdf` | Export PDF paie | Admin/RH/Secretaire |
| GET | `/api/export/contrats/excel` | Export Excel contrats | Admin/RH/Secretaire |
| GET | `/api/export/contrats/pdf` | Export PDF contrats | Admin/RH/Secretaire |

### 8.14 Rapports — `/api/rapports`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/rapports/employes/excel` | Rapport RH global multi-feillets | Admin/RH |

### 8.15 Prédictions IA — `/api/ia`

| Méthode | Endpoint | Description | Accès |
|---|---|---|---|
| GET | `/api/ia/predictions` | Prédictions turnover | Admin/RH/Manager |
| POST | `/api/ia/predict` | Lancer prédiction | Admin/RH/Manager |
| GET | `/api/ia/employees/{id}/score` | Score individuel | Admin/RH/Manager |

---

## 9. Installation & Déploiement

### 9.1 Prérequis

- **Java 17+**
- **Node.js 20+**
- **MySQL 8+** (via WAMP, XAMPP ou installation directe)
- **Python 3.9+** (optionnel, pour le service ML)

### 9.2 Backend (Spring Boot)

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd sigrh-backend

# 2. Configurer la base de données
# Éditer src/main/resources/application.properties :
#   spring.datasource.url, username, password

# 3. Configurer l'email SMTP (optionnel mais recommandé)
#   spring.mail.username=votre.email@gmail.com
#   spring.mail.password=votre-mot-de-passe-app

# 4. Lancer l'application
./mvnw spring-boot:run
# ou sous Windows :
mvnw.cmd spring-boot:run

# L'API démarre sur http://localhost:8080
# Swagger UI : http://localhost:8080/swagger-ui.html
```

### 9.3 Frontend (React)

```bash
cd sigrh-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# L'application démarre sur http://localhost:5173
```

### 9.4 Service ML (optionnel)

```bash
cd sigrh-backend/ml-service

# Installer les dépendances Python
pip install -r requirements.txt

# Lancer le service
python main.py

# L'API ML démarre sur http://localhost:8000
```

### 9.5 Base de données

- **Mode développement** : `spring.jpa.hibernate.ddl-auto=update` crée/met à jour automatiquement le schéma
- Un `DataInitializer.java` insère des données de démonstration si la base est vide (6 comptes, départements, employés)

### 9.6 Comptes de démonstration

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Admin | `admin` | `admin123` |
| RH | `rh` | `rh123` |
| Manager | `manager` | `manager123` |
| Employé 1 | `employe` | `employe123` |
| Employé 2 | `employe2` | `employe123` |
| Secrétaire | `secretaire` | `secretaire123` |

---

## 10. Annexes

### 10.1 Modèle de données (entités principales)

```
Employe (1) ──── (N) Conge
Employe (1) ──── (N) Presence
Employe (1) ──── (N) FichePaie
Employe (1) ──── (N) Contrat
Employe (1) ──── (N) AlerteRH
Employe (1) ──── (1) User
Employe (N) ──── (1) Departement
Employe (1) ──── (N) SoldeConge
Employe (1) ──── (N) AttributionMateriel
Materiel (1) ──── (1) CategorieMateriel
Materiel (1) ──── (N) AttributionMateriel
```

### 10.2 Énumérations clés

| Enum | Valeurs |
|---|---|
| `Role` | ADMIN, RH, MANAGER, EMPLOYE, SECRETAIRE |
| `StatutEmploye` | ACTIF, INACTIF, SUSPENDU, EN_CONGE, DEPART |
| `TypeConge` | ANNUEL, MALADIE, MATERNITE, SANS_SOLDE, EXCEPTIONNEL |
| `StatutConge` | EN_ATTENTE, APPROUVE, REFUSE |
| `StatutPresence` | PRESENT, ABSENT, RETARD, CONGE |
| `TypeContrat` | CDI, CDD, STAGE, PRESTATION, ALTERNANCE |
| `NiveauAlerte` | FAIBLE, MOYEN, ELEVE, CRITIQUE |
| `Genre` | MASCULIN, FEMININ |

### 10.3 Configuration SMTP (Gmail)

Pour l'envoi d'emails via Gmail :

1. Activer **l'authentification à deux facteurs** sur le compte Google
2. Générer un **mot de passe d'application** : https://myaccount.google.com/apppasswords
3. Copier le mot de passe à 16 caractères dans `application.properties` :
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=mon.email@gmail.com
spring.mail.password=xxxx xxxx xxxx xxxx
```

### 10.4 Configuration JWT

```properties
# Durée de validité
jwt.expiration=1800000          # 30 minutes (access token)
jwt.refresh-expiration=604800000  # 7 jours (refresh token)

# Clé secrète (256 bits minimum pour HS256)
jwt.secret=votre_cle_secrete_tres_longue...
```

### 10.5 Documentation API interactive

Une fois le backend lancé, la documentation Swagger/OpenAPI est accessible :

- **UI** : http://localhost:8080/swagger-ui.html
- **JSON** : http://localhost:8080/api-docs

---

> **Contact support** : Pour toute assistance technique, contacter l'équipe SIGRH via le lien "Contactez le support" depuis la page de connexion de l'application.

> **Licence** : Solution propriétaire — SIGRH Technology © 2025
