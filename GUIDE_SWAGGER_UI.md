# 🎯 Guide Swagger UI - SIGRH API

## 📍 Accéder à Swagger UI

**URL:** `http://localhost:8080/swagger-ui.html`

Après que l'application soit démarrée, vous verrez l'interface Swagger interactive.

---

## 🏠 Interface Swagger UI

```
┌─────────────────────────────────────────────────────────────────┐
│  SIGRH API - Système de Gestion des Ressources Humaines  v1.0.0  │
│                                                                   │
│  API complète pour la gestion des employés, congés, présences    │
│  et paies                                                          │
│                                                                   │
│  [ Authorize 🔒 ]                                                 │
└─────────────────────────────────────────────────────────────────┘

├── Authentication
│   ├── [POST] /api/auth/login
│   └── Request body: { username, password }
│
├── Employees  
│   ├── [GET] /api/employes
│   ├── [GET] /api/employes/{id}
│   ├── [GET] /api/employes/search?q=...
│   ├── [POST] /api/employes
│   ├── [PUT] /api/employes/{id}
│   └── [DELETE] /api/employes/{id}
│
├── Departments
│   ├── [GET] /api/departements
│   ├── [GET] /api/departements/{id}
│   ├── [POST] /api/departements
│   ├── [PUT] /api/departements/{id}
│   └── [DELETE] /api/departements/{id}
│
├── Leaves (Congés)
│   ├── [GET] /api/conges
│   ├── [GET] /api/conges/{id}
│   ├── [GET] /api/conges/employe/{employeId}
│   ├── [POST] /api/conges
│   ├── [PUT] /api/conges/{id}
│   ├── [PUT] /api/conges/{id}/valider  ⭐ Endpoint spécial
│   └── [DELETE] /api/conges/{id}
│
├── Attendance (Présences)
│   ├── [GET] /api/presences
│   ├── [GET] /api/presences/{id}
│   ├── [GET] /api/presences/employe/{employeId}?debut=...&fin=...
│   ├── [GET] /api/presences/date/{date}
│   ├── [POST] /api/presences
│   ├── [PUT] /api/presences/{id}
│   └── [DELETE] /api/presences/{id}
│
├── Payroll (Fiches Paie)
│   ├── [GET] /api/fiches-paie
│   ├── [GET] /api/fiches-paie/{id}
│   ├── [GET] /api/fiches-paie/employe/{employeId}
│   ├── [POST] /api/fiches-paie
│   ├── [POST] /api/fiches-paie/generer?employeId=...&mois=...&annee=...  ⭐ Auto-calcul
│   ├── [PUT] /api/fiches-paie/{id}
│   └── [DELETE] /api/fiches-paie/{id}
│
└── Search
    └── [GET] /api/search?q=...
```

---

## 🔐 Authentification dans Swagger

### Étape 1: Cliquer sur "Authorize" (🔒)

```
┌──────────────────────────────────────┐
│ Authorize                            │
├──────────────────────────────────────┤
│                                      │
│ SecurityScheme: Bearer JWT           │
│                                      │
│ [ Value ]                            │
│ ┌──────────────────────────────────┐ │
│ │ Bearer {token_jwt}               │ │
│ └──────────────────────────────────┘ │
│                                      │
│              [Authorize] [Logout]    │
└──────────────────────────────────────┘
```

### Étape 2: Récupérer le Token

1. Aller à l'endpoint **POST `/api/auth/login`**
2. Cliquer sur **"Try it out"**
3. Remplir le body:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Cliquer sur **"Execute"**
5. Récupérer le `token` dans la réponse

### Étape 3: Utiliser le Token

1. Cliquer sur **"Authorize"** (🔒) en haut
2. Copier-coller le token complètement dans le champ `Value`:
   ```
   Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6...
   ```
3. Cliquer **"Authorize"**
4. ✅ Maintenant tous les endpoints protégés fonctionnent !

---

## 🧪 Tester un Endpoint dans Swagger

### Exemple: Créer un Employé

**Endpoint:** `POST /api/employes`

**Étapes:**

1. Cliquer sur l'endpoint
   ```
   POST /api/employes - Create Employee
   ```

2. Cliquer sur **"Try it out"**
   ```
   ┌─────────────────────────────────────┐
   │ [Try it out]                        │
   └─────────────────────────────────────┘
   ```

3. Remplir le formulaire ou le JSON:
   ```json
   {
     "matricule": "EMP002",
     "nom": "Dupont",
     "prenom": "Jean",
     "email": "jean.dupont@sigrh.com",
     "telephone": "+223 66 12 34 56",
     "genre": "MASCULIN",
     "dateNaissance": "1990-05-15",
     "dateEmbauche": "2023-01-10",
     "poste": "Développeur",
     "salaire": 450000,
     "departementId": 1,
     "statut": "ACTIF"
   }
   ```

4. Cliquer **"Execute"**

5. Voir la réponse:
   ```
   Code: 201
   Response Body:
   {
     "id": 2,
     "matricule": "EMP002",
     "nom": "Dupont",
     "prenom": "Jean",
     ...
   }
   ```

---

## 🎨 Features de Swagger UI

### 1. **Documentations Interactives**
   - Descriptions de chaque endpoint
   - Paramètres requis ⭐ vs optionnels
   - Types de données
   - Exemples de réponse

### 2. **Models/Schemas**
   - Voir la structure complète des DTOs
   - Voir les relations entre entités
   - Voir les enums (Role, Genre, StatutEmploye, etc.)

### 3. **Try It Out** (Tester directement)
   - Pas besoin de Postman
   - Pas besoin de curl
   - Interface graphique intuitive

### 4. **Responses**
   - Code HTTP (200, 201, 400, 401, 403, 404, 500)
   - Headers
   - Body formaté JSON
   - Exemples de réponse

### 5. **cURL Command**
   - Chaque requête testé montre la commande cURL équivalente
   - Utile pour les scripts

---

## 📊 Cas d'Usage Complet dans Swagger

### Scénario: Créer un employé et demander un congé

#### 1️⃣ **Login** - POST /api/auth/login
   ```json
   Request:
   { "username": "admin", "password": "admin123" }
   
   Response 200:
   { "token": "eyJ...", "role": "ADMIN", "employeId": 1 }
   ```
   **➡️ Copier le token**

#### 2️⃣ **Create Employee** - POST /api/employes
   ```json
   Request:
   {
     "matricule": "EMP002",
     "nom": "Dupont",
     "prenom": "Jean",
     ...
     "departementId": 1
   }
   
   Response 201:
   { "id": 2, "matricule": "EMP002", ... }
   ```
   **➡️ Noter l'ID retourné: 2**

#### 3️⃣ **Create Leave** - POST /api/conges
   ```json
   Request:
   {
     "employeId": 2,
     "type": "ANNUEL",
     "dateDebut": "2024-06-01",
     "dateFin": "2024-06-15",
     "nombreJours": 15,
     "motif": "Vacances",
     "statut": "EN_ATTENTE"
   }
   
   Response 201:
   { "id": 1, "employeId": 2, "statut": "EN_ATTENTE", ... }
   ```
   **➡️ Noter l'ID retourné: 1**

#### 4️⃣ **Validate Leave** - PUT /api/conges/1/valider
   ```json
   Request:
   {
     "statut": "APPROUVE",
     "commentaireRH": "Approuvé"
   }
   
   Response 200:
   { "id": 1, "statut": "APPROUVE", ... }
   ```
   **✅ Congé approuvé !**

---

## 🔗 Ressources

- **Swagger UI Home**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs
- **API YAML**: http://localhost:8080/api-docs.yaml

---

## 💡 Conseils

✅ **Toujours** commencer par login pour obtenir le token
✅ **Toujours** utiliser l'Authorize avant de tester d'autres endpoints
✅ **Utiliser** "Try it out" directement dans Swagger plutôt que Postman au départ
✅ **Noter** les IDs retournés pour les requêtes suivantes
✅ **Vérifier** les codes HTTP (201 = créé, 200 = ok, 400 = erreur, etc.)
✅ **Tester** d'abord les endpoints GET pour vérifier les données
✅ **Tester** les endpoints POST pour créer des données
✅ **Tester** les endpoints PUT pour modifier les données
✅ **Tester** les endpoints DELETE pour supprimer les données

---

## 🐛 Troubleshooting

| Erreur | Cause | Solution |
|--------|-------|----------|
| **401 Unauthorized** | Token manquant ou invalide | Cliquer "Authorize" et entrer le token |
| **403 Forbidden** | Permission insuffisante | Vérifier le rôle (ADMIN, RH, MANAGER, EMPLOYE) |
| **400 Bad Request** | JSON malformé ou champ manquant | Vérifier le format des données |
| **404 Not Found** | Ressource n'existe pas | Vérifier l'ID utilié |
| **500 Server Error** | Erreur serveur | Vérifier les logs de l'application |

