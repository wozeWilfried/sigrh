# 📘 Guide de Test des Endpoints SIGRH

## 🚀 Démarrage Rapide

### 1. Installer les dépendances Maven

```bash
cd d:\sigrh\sigrh-backend
mvn clean install
```

### 2. Démarrer l'application

```bash
mvn spring-boot:run
```

L'application démarrera sur `http://localhost:8080`

---

## 🔍 Accéder à Swagger UI

Une fois l'application démarrée, accédez à Swagger UI :

**URL Swagger UI:** http://localhost:8080/swagger-ui.html

**URL API Docs (JSON):** http://localhost:8080/api-docs

### Vous verrez dans Swagger :
- ✅ Tous les endpoints REST organisés par catégorie
- ✅ Description de chaque endpoint
- ✅ Paramètres requis et optionnels
- ✅ Formats de requête/réponse
- ✅ Codes HTTP de réponse
- ✅ **Bouton "Try it out"** pour tester directement dans le navigateur

---

## 📝 Utiliser Postman pour les Tests

### Importer la Collection Postman

1. Ouvrir Postman
2. Cliquer sur **"Import"**
3. Sélectionner le fichier: `d:\sigrh\SIGRH_Postman_Collection.json`
4. La collection complète s'importe avec tous les endpoints

### Structure de la Collection

```
📦 SIGRH API - Tests Endpoints
├── 🔐 Authentication
│   └── Login
├── 👥 Employees
│   ├── Get All Employees
│   ├── Get Employee by ID
│   ├── Search Employees
│   ├── Create Employee
│   ├── Update Employee
│   └── Delete Employee
├── 🏢 Departments
│   ├── Get All Departments
│   └── Create Department
├── 📅 Leaves (Congés)
│   ├── Get All Leaves
│   ├── Create Leave Request
│   ├── Get Leaves by Employee
│   └── Validate Leave
├── ⏰ Attendance (Présences)
│   ├── Get All Attendance
│   ├── Record Attendance
│   └── Get Attendance by Employee
├── 💰 Payroll (Fiches Paie)
│   ├── Get All Payroll
│   ├── Generate Payroll
│   └── Get Payroll by Employee
└── 🔍 Search
    └── Global Search
```

---

## 🧪 Scénario de Test Complet

### Étape 1️⃣ : Authentification (Login)

**Endpoint:** `POST /api/auth/login`

**Requête JSON:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Réponse Attendue:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6...",
  "role": "ADMIN",
  "username": "admin",
  "employeId": 1
}
```

**➡️ Copier le `token` reçu**

---

### Étape 2️⃣ : Créer un Employé

**Endpoint:** `POST /api/employes`

**Headers:**
```
Authorization: Bearer {token_copié}
Content-Type: application/json
```

**Requête JSON:**
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

**Réponse:** `201 Created` ✅

---

### Étape 3️⃣ : Récupérer tous les Employés

**Endpoint:** `GET /api/employes`

**Headers:**
```
Authorization: Bearer {token_copié}
```

**Réponse:** Liste de tous les employés ✅

---

### Étape 4️⃣ : Demander un Congé

**Endpoint:** `POST /api/conges`

**Headers:**
```
Authorization: Bearer {token_copié}
Content-Type: application/json
```

**Requête JSON:**
```json
{
  "employeId": 2,
  "type": "ANNUEL",
  "dateDebut": "2024-06-01",
  "dateFin": "2024-06-15",
  "nombreJours": 15,
  "motif": "Vacances d'été",
  "statut": "EN_ATTENTE",
  "commentaireRH": ""
}
```

**Réponse:** `201 Created` ✅

---

### Étape 5️⃣ : Valider le Congé (Rôle RH)

**Endpoint:** `PUT /api/conges/{id}/valider`

**Headers:**
```
Authorization: Bearer {token_copié}
Content-Type: application/json
```

**Requête JSON:**
```json
{
  "statut": "APPROUVE",
  "commentaireRH": "Congé approuvé"
}
```

**Réponse:** Congé mis à jour avec statut `APPROUVE` ✅

---

### Étape 6️⃣ : Enregistrer une Présence

**Endpoint:** `POST /api/presences`

**Headers:**
```
Authorization: Bearer {token_copié}
Content-Type: application/json
```

**Requête JSON:**
```json
{
  "employe": {
    "id": 2
  },
  "date": "2024-05-25",
  "heureArrivee": "08:30:00",
  "heureDepart": "17:00:00",
  "statut": "PRESENT"
}
```

**Réponse:** `201 Created` ✅

---

### Étape 7️⃣ : Générer une Fiche de Paie

**Endpoint:** `POST /api/fiches-paie/generer`

**URL:** 
```
http://localhost:8080/api/fiches-paie/generer?employeId=2&mois=5&annee=2024
```

**Headers:**
```
Authorization: Bearer {token_copié}
```

**Réponse:** Fiche de paie générée avec calculs automatiques ✅

**Calculs:**
- Salaire Brut: 450 000
- CNPS (8%): 36 000
- IRPP (10%): 45 000
- **Salaire Net: 369 000** ✅

---

### Étape 8️⃣ : Recherche Globale

**Endpoint:** `GET /api/search?q=dupont`

**Headers:**
```
Authorization: Bearer {token_copié}
```

**Réponse:** 
```json
{
  "employes": [
    {
      "id": 2,
      "nom": "Dupont Jean",
      "matricule": "EMP002",
      "poste": "Développeur",
      "type": "employe"
    }
  ],
  "departements": [],
  "total": 1
}
```

---

## 📂 Fichiers JSON de Test

Les fichiers JSON individuels se trouvent dans `d:\sigrh\tests\`:

| Fichier | Description |
|---------|-------------|
| `01_login.json` | Authentification |
| `02_create_employee.json` | Créer un employé |
| `03_get_employees.json` | Récupérer tous les employés |
| `04_create_leave.json` | Demander un congé |
| `05_validate_leave.json` | Valider un congé |
| `06_record_attendance.json` | Enregistrer une présence |
| `07_generate_payroll.json` | Générer une fiche de paie |
| `08_global_search.json` | Recherche globale |
| `09_create_department.json` | Créer un département |
| `10_update_employee.json` | Modifier un employé |

---

## 🔑 Rôles et Permissions

| Endpoint | PUBLIC | AUTH | RH | ADMIN |
|----------|--------|------|----|----|
| POST /api/auth/login | ✅ | - | - | - |
| GET /api/employes | - | ✅ | ✅ | ✅ |
| POST /api/employes | - | - | ✅ | ✅ |
| PUT /api/employes/{id} | - | - | ✅ | ✅ |
| DELETE /api/employes/{id} | - | - | - | ✅ |
| GET /api/conges | - | ✅ | ✅ | ✅ |
| POST /api/conges | - | ✅ | ✅ | ✅ |
| PUT /api/conges/{id}/valider | - | - | ✅ | ✅ |
| GET /api/presences | - | ✅ | ✅ | ✅ |
| POST /api/presences | - | ✅ | ✅ | ✅ |
| GET /api/fiches-paie | - | - | ✅ | ✅ |
| POST /api/fiches-paie/generer | - | - | ✅ | ✅ |

---

## ⚠️ Codes HTTP Attendus

| Code | Signification |
|------|------------|
| `200` | OK - Requête réussie |
| `201` | Created - Ressource créée |
| `204` | No Content - Suppression réussie |
| `400` | Bad Request - Erreur de validation |
| `401` | Unauthorized - Token invalide/manquant |
| `403` | Forbidden - Permissions insuffisantes |
| `404` | Not Found - Ressource inexistante |
| `500` | Internal Server Error - Erreur serveur |

---

## 🐛 Dépannage

### ❌ Erreur 401: Unauthorized

**Solution:** 
- Vérifier que le token JWT est présent dans l'en-tête `Authorization`
- Vérifier le format: `Authorization: Bearer {token}`
- Le token a peut-être expiré (24h), relancer login

### ❌ Erreur 403: Forbidden

**Solution:**
- Vérifier que votre rôle a la permission pour cette action
- Exemple: Seul ADMIN peut supprimer un employé

### ❌ Erreur 400: Bad Request

**Solution:**
- Vérifier le format JSON de la requête
- Vérifier que tous les champs obligatoires sont présents
- Vérifier les valeurs des enums (ACTIF, INACTIF, SUSPENDU, etc.)

### ❌ La base de données ne se crée pas

**Solution:**
- Vérifier que MySQL/WAMP est en cours d'exécution
- Vérifier la URL de connexion dans `application.properties`
- Le script de création est automatique (hibernate.ddl-auto=update)

---

## 🎯 Prochaines Étapes

✅ Tester tous les endpoints via Swagger UI
✅ Importer et utiliser la collection Postman
✅ Vérifier les réponses avec les fichiers JSON fournis
✅ Configurer votre frontend pour communiquer avec l'API

---

## 📞 Support

Pour toute question ou problème:
- Vérifier les logs de l'application
- Consulter Swagger UI pour la documentation interactive
- Vérifier les en-têtes HTTP et le token JWT
