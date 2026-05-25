# ✅ SETUP COMPLET - SIGRH Backend

## 📋 Checklist d'Installation

```
✅ Backend Structure
  ├── config/         → SecurityConfig, CorsConfig, DataInitializer, OpenApiConfig
  ├── controller/     → 7 Controllers REST (Auth, Employees, Departments, Leaves, Attendance, Payroll, Search)
  ├── service/        → 7 Services (Auth, Employees, Departments, Leaves, Attendance, Payroll, Search)
  ├── repository/     → 6 Repositories JPA
  ├── entity/         → 6 Entités JPA (User, Employe, Departement, Conge, Presence, FichePaie)
  ├── dto/            → 4 DTOs (AuthRequest, AuthResponse, EmployeDTO, CongeDTO)
  ├── security/       → JWT Utilities (JwtUtil, JwtFilter)
  └── enum/           → 6 Enums (Role, Genre, StatutEmploye, TypeConge, StatutConge, StatutPresence)

✅ Dépendances Maven
  ├── Spring Boot 4.0.6
  ├── Spring Security + JWT
  ├── Spring Data JPA + Hibernate
  ├── MySQL Driver
  ├── Lombok
  └── SpringDoc OpenAPI 2.0.2 (Swagger 3)

✅ Configuration
  ├── application.properties → DB, JWT, CORS, Swagger
  └── OpenApiConfig.java → Configuration Swagger/OpenAPI 3.0

✅ Données Initiales
  └── Admin user: username=admin, password=admin123 (auto-créé au démarrage)

✅ Documentation & Tests
  ├── GUIDE_TEST_ENDPOINTS.md → Guide complet des tests
  ├── GUIDE_SWAGGER_UI.md → Guide Swagger interactif
  ├── SIGRH_Postman_Collection.json → Collection Postman complète
  ├── POSTMAN_VARIABLES.json → Variables Postman réutilisables
  └── tests/ → 10 fichiers JSON d'exemples
```

---

## 🚀 Quick Start (2 minutes)

### 1️⃣ Démarrer MySQL/WAMP
```bash
# Assurez-vous que MySQL/WAMP tourne
# La base de données se crée automatiquement
```

### 2️⃣ Compiler et Démarrer
```bash
cd d:\sigrh\sigrh-backend
mvn clean install
mvn spring-boot:run
```

### 3️⃣ Accéder à Swagger UI
```
🌐 http://localhost:8080/swagger-ui.html
```

### 4️⃣ Tester le Login
```bash
POST /api/auth/login
Body: { "username": "admin", "password": "admin123" }
Response: { "token": "...", "role": "ADMIN", ... }
```

### 5️⃣ Copier le Token et Tester les Autres Endpoints
```
Authorization: Bearer {token_reçu}
```

---

## 📊 Résumé des Endpoints

### 🔐 Authentication (1 endpoint)
| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| POST | `/api/auth/login` | ❌ Public | - |

### 👥 Employees (6 endpoints)
| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| GET | `/api/employes` | ✅ | AUTH |
| GET | `/api/employes/{id}` | ✅ | AUTH |
| GET | `/api/employes/search?q=` | ✅ | AUTH |
| POST | `/api/employes` | ✅ | RH/ADMIN |
| PUT | `/api/employes/{id}` | ✅ | RH/ADMIN |
| DELETE | `/api/employes/{id}` | ✅ | ADMIN |

### 🏢 Departments (5 endpoints)
| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| GET | `/api/departements` | ✅ | AUTH |
| GET | `/api/departements/{id}` | ✅ | AUTH |
| POST | `/api/departements` | ✅ | ADMIN |
| PUT | `/api/departements/{id}` | ✅ | ADMIN |
| DELETE | `/api/departements/{id}` | ✅ | ADMIN |

### 📅 Leaves/Congés (7 endpoints)
| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| GET | `/api/conges` | ✅ | AUTH |
| GET | `/api/conges/{id}` | ✅ | AUTH |
| GET | `/api/conges/employe/{id}` | ✅ | AUTH |
| POST | `/api/conges` | ✅ | AUTH |
| PUT | `/api/conges/{id}` | ✅ | RH/ADMIN |
| PUT | `/api/conges/{id}/valider` | ✅ | RH/ADMIN |
| DELETE | `/api/conges/{id}` | ✅ | ADMIN |

### ⏰ Attendance/Présences (7 endpoints)
| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| GET | `/api/presences` | ✅ | AUTH |
| GET | `/api/presences/{id}` | ✅ | AUTH |
| GET | `/api/presences/employe/{id}?debut=&fin=` | ✅ | AUTH |
| GET | `/api/presences/date/{date}` | ✅ | AUTH |
| POST | `/api/presences` | ✅ | AUTH |
| PUT | `/api/presences/{id}` | ✅ | RH/ADMIN |
| DELETE | `/api/presences/{id}` | ✅ | ADMIN |

### 💰 Payroll/Fiches Paie (7 endpoints)
| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| GET | `/api/fiches-paie` | ✅ | RH/ADMIN |
| GET | `/api/fiches-paie/{id}` | ✅ | RH/ADMIN |
| GET | `/api/fiches-paie/employe/{id}` | ✅ | RH/ADMIN |
| POST | `/api/fiches-paie` | ✅ | RH/ADMIN |
| POST | `/api/fiches-paie/generer?employeId=&mois=&annee=` | ✅ | RH/ADMIN |
| PUT | `/api/fiches-paie/{id}` | ✅ | RH/ADMIN |
| DELETE | `/api/fiches-paie/{id}` | ✅ | ADMIN |

### 🔍 Search (1 endpoint)
| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| GET | `/api/search?q=` | ✅ | AUTH |

---

## 📂 Fichiers de Configuration

### `application.properties`
```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/sigrh_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=

# JWT
jwt.secret=sigrh_super_secret_key_2024_minimum_256bits...
jwt.expiration=86400000

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/api-docs

# CORS
app.cors.allowed-origins=http://localhost:5173
```

---

## 🧪 Fichiers de Test

| Fichier | URL |
|---------|-----|
| Postman Collection | `d:\sigrh\SIGRH_Postman_Collection.json` |
| Guide Tests | `d:\sigrh\GUIDE_TEST_ENDPOINTS.md` |
| Guide Swagger | `d:\sigrh\GUIDE_SWAGGER_UI.md` |
| Variables Postman | `d:\sigrh\POSTMAN_VARIABLES.json` |
| Exemples JSON | `d:\sigrh\tests\*.json` (10 fichiers) |

---

## 🔗 URLs d'Accès

| Service | URL |
|---------|-----|
| **Swagger UI** | http://localhost:8080/swagger-ui.html |
| **API Docs (JSON)** | http://localhost:8080/api-docs |
| **API Docs (YAML)** | http://localhost:8080/api-docs.yaml |
| **Application** | http://localhost:8080 |
| **Base de Données** | localhost:3306 |

---

## 👤 Utilisateurs par Défaut

| Username | Password | Rôle | Poste |
|----------|----------|------|-------|
| admin | admin123 | ADMIN | Administrateur |

**Note:** Pour créer d'autres utilisateurs, utiliser le POST `/api/employes`

---

## 🔐 Rôles Disponibles

| Rôle | Permissions |
|------|------------|
| **ADMIN** | Accès complet - Créer/Modifier/Supprimer tout |
| **RH** | Gestion employés/congés/paies - Pas de suppression |
| **MANAGER** | Lecture employés/conges/presences |
| **EMPLOYE** | Lecture propre profil, Demande congé/presence |

---

## 🎯 Architecture Backend

```
┌─────────────────────────────────────────┐
│         Frontend React                   │
│     (sigrh-frontend:5173)                │
└─────────────┬───────────────────────────┘
              │
              │ HTTP/REST + JWT
              ▼
┌─────────────────────────────────────────┐
│     Spring Boot Application              │
│     (Backend SIGRH:8080)                 │
├─────────────────────────────────────────┤
│  Controllers                             │
│  ├── AuthController                      │
│  ├── EmployeController                   │
│  ├── DepartementController               │
│  ├── CongeController                     │
│  ├── PresenceController                  │
│  ├── FichePaieController                 │
│  └── SearchController                    │
├─────────────────────────────────────────┤
│  Services                                │
│  ├── AuthService                         │
│  ├── EmployeService                      │
│  ├── DepartementService                  │
│  ├── CongeService                        │
│  ├── PresenceService                     │
│  ├── FichePaieService                    │
│  └── SearchService                       │
├─────────────────────────────────────────┤
│  Repositories (JPA)                      │
│  ├── UserRepository                      │
│  ├── EmployeRepository                   │
│  ├── DepartementRepository               │
│  ├── CongeRepository                     │
│  ├── PresenceRepository                  │
│  └── FichePaieRepository                 │
├─────────────────────────────────────────┤
│  Security & Utils                        │
│  ├── SecurityConfig                      │
│  ├── JwtUtil / JwtFilter                 │
│  ├── DataInitializer                     │
│  └── OpenApiConfig (Swagger)             │
└─────────────┬───────────────────────────┘
              │
              │ JDBC
              ▼
┌─────────────────────────────────────────┐
│     MySQL Database                       │
│     sigrh_db                             │
│  ├── users                               │
│  ├── employes                            │
│  ├── departements                        │
│  ├── conges                              │
│  ├── presences                           │
│  └── fiches_paie                         │
└─────────────────────────────────────────┘
```

---

## ✨ Features Implémentées

✅ **Authentification JWT** - Login sécurisé avec tokens
✅ **Gestion des Employés** - CRUD complet avec recherche
✅ **Gestion des Congés** - Demande et validation
✅ **Gestion des Présences** - Enregistrement quotidien
✅ **Gestion des Paies** - Génération avec calculs auto
✅ **Gestion des Départements** - Organisation des équipes
✅ **Recherche Globale** - Recherche multi-entités
✅ **Swagger/OpenAPI 3.0** - Documentation interactive
✅ **CORS** - Accepte requêtes du frontend
✅ **Données Initiales** - Admin auto-créé

---

## 🎓 Prochaines Étapes

1. ✅ **Tester via Swagger** - http://localhost:8080/swagger-ui.html
2. ✅ **Importer Postman Collection** - SIGRH_Postman_Collection.json
3. ✅ **Lire les Guides** - GUIDE_TEST_ENDPOINTS.md & GUIDE_SWAGGER_UI.md
4. ✅ **Créer des données** - Employés, Congés, Présences
5. ✅ **Intégrer le Frontend** - React sigrh-frontend

---

## 📞 Support & Ressources

- 📘 **Swagger UI**: http://localhost:8080/swagger-ui.html
- 📄 **OpenAPI JSON**: http://localhost:8080/api-docs
- 📚 **Guide Complet**: GUIDE_TEST_ENDPOINTS.md
- 🧪 **Postman**: SIGRH_Postman_Collection.json

**Bon développement ! 🚀**
