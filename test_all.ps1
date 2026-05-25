$BASE = "http://localhost:8080"
$token = (Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -TimeoutSec 10).token
$h = @{"Authorization" = "Bearer $token"}
$jh = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
$ok = 0; $fail = 0

function T($name, $method, $url, $body, $expected) {
    try {
        if ($body) { $r = Invoke-WebRequest -Uri $url -Method $method -Headers $jh -Body $body -UseBasicParsing -TimeoutSec 10 }
        else { $r = Invoke-WebRequest -Uri $url -Method $method -Headers $h -UseBasicParsing -TimeoutSec 10 }
        if ($r.StatusCode -eq $expected) { Write-Host "  OK $($r.StatusCode) $name"; $script:ok++ }
        else { Write-Host "  FAIL $($r.StatusCode) $name (expected $expected)"; $script:fail++ }
    } catch {
        try { $sc = $_.Exception.Response.StatusCode.value__ } catch { $sc = "ERR" }
        Write-Host "  FAIL $sc $name"; $script:fail++
    }
}

Write-Host "=== AUTH ===" -ForegroundColor Cyan
T "POST /api/auth/login" "POST" "$BASE/api/auth/login" '{"username":"admin","password":"admin123"}' 200

Write-Host "`n=== EMPLOYES ===" -ForegroundColor Cyan
T "GET /api/employes" "GET" "$BASE/api/employes" $null 200
T "GET /api/employes/1" "GET" "$BASE/api/employes/1" $null 200
T "GET /api/employes/search?q=admin" "GET" "$BASE/api/employes/search?q=admin" $null 200
T "POST /api/employes" "POST" "$BASE/api/employes" '{"matricule":"T001","nom":"Test","prenom":"U","email":"t@t.com","telephone":"+223","genre":"MASCULIN","dateNaissance":"1990-01-01","dateEmbauche":"2023-01-01","poste":"Dev","salaire":500000,"departementId":1,"statut":"ACTIF"}' 201
$emps = Invoke-RestMethod -Uri "$BASE/api/employes" -Headers $h -TimeoutSec 5
$eid = ($emps | Select-Object -Last 1).id
T "PUT /api/employes/$eid" "PUT" "$BASE/api/employes/$eid" '{"matricule":"T001","nom":"Updated","prenom":"U","email":"t@t.com","telephone":"+223","genre":"MASCULIN","dateNaissance":"1990-01-01","dateEmbauche":"2023-01-01","poste":"Senior","salaire":600000,"departementId":1,"statut":"ACTIF"}' 200
T "DELETE /api/employes/$eid" "DELETE" "$BASE/api/employes/$eid" $null 204

Write-Host "`n=== DEPARTEMENTS ===" -ForegroundColor Cyan
T "GET /api/departements" "GET" "$BASE/api/departements" $null 200
T "POST /api/departements" "POST" "$BASE/api/departements" '{"nom":"IT","description":"IT Dept"}' 201
$deps = Invoke-RestMethod -Uri "$BASE/api/departements" -Headers $h -TimeoutSec 5
$did = ($deps | Select-Object -Last 1).id
T "PUT /api/departements/$did" "PUT" "$BASE/api/departements/$did" '{"nom":"IT Upd","description":"Updated"}' 200
T "DELETE /api/departements/$did" "DELETE" "$BASE/api/departements/$did" $null 204

Write-Host "`n=== CONGES ===" -ForegroundColor Cyan
T "GET /api/conges" "GET" "$BASE/api/conges" $null 200
T "POST /api/conges" "POST" "$BASE/api/conges" '{"employeId":1,"type":"ANNUEL","dateDebut":"2024-06-01","dateFin":"2024-06-15","nombreJours":15,"motif":"Vacances","statut":"EN_ATTENTE"}' 201
$leaves = Invoke-RestMethod -Uri "$BASE/api/conges" -Headers $h -TimeoutSec 5
$lcid = ($leaves | Select-Object -Last 1).id
T "PUT /api/conges/$lcid/valider" "PUT" "$BASE/api/conges/$lcid/valider" '{"statut":"APPROUVE","commentaireRH":"OK"}' 200
T "DELETE /api/conges/$lcid" "DELETE" "$BASE/api/conges/$lcid" $null 204

Write-Host "`n=== PRESENCES ===" -ForegroundColor Cyan
T "GET /api/presences" "GET" "$BASE/api/presences" $null 200
T "POST /api/presences" "POST" "$BASE/api/presences" '{"employeId":1,"date":"2024-05-25","statut":"PRESENT","heureArrivee":"08:30","heureDepart":"17:00"}' 201
$pres = Invoke-RestMethod -Uri "$BASE/api/presences" -Headers $h -TimeoutSec 5
$ppid = ($pres | Select-Object -Last 1).id
T "GET /api/presences/employe/1?debut=2024-01-01&fin=2024-12-31" "GET" "$BASE/api/presences/employe/1?debut=2024-01-01&fin=2024-12-31" $null 200
T "GET /api/presences/rapport/1?mois=5&annee=2024" "GET" "$BASE/api/presences/rapport/1?mois=5&annee=2024" $null 200

Write-Host "`n=== FICHES DE PAIE ===" -ForegroundColor Cyan
T "GET /api/paie" "GET" "$BASE/api/paie" $null 200
T "GET /api/paie?employeId=1" "GET" "$BASE/api/paie?employeId=1" $null 200
T "POST /api/paie/generer" "POST" "$BASE/api/paie/generer" '{"employeId":1,"mois":7,"annee":2024}' 201
T "PUT /api/paie/1/valider" "PUT" "$BASE/api/paie/1/valider" $null 200

Write-Host "`n=== SEARCH ===" -ForegroundColor Cyan
T "GET /api/search?q=admin" "GET" "$BASE/api/search?q=admin" $null 200

Write-Host "`n=== ANALYSE PREDICTIVE ===" -ForegroundColor Cyan
T "GET /api/analyse/dashboard" "GET" "$BASE/api/analyse/dashboard" $null 200
T "GET /api/analyse/turnover" "GET" "$BASE/api/analyse/turnover" $null 200
T "GET /api/analyse/turnover/1" "GET" "$BASE/api/analyse/turnover/1" $null 200
T "GET /api/analyse/absenteisme" "GET" "$BASE/api/analyse/absenteisme" $null 200
T "GET /api/analyse/masse-salariale" "GET" "$BASE/api/analyse/masse-salariale" $null 200
T "GET /api/analyse/tendance-conges" "GET" "$BASE/api/analyse/tendance-conges" $null 200
T "GET /api/analyse/alertes" "GET" "$BASE/api/analyse/alertes" $null 200
T "POST /api/analyse/alertes/generer" "POST" "$BASE/api/analyse/alertes/generer" $null 200

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  RESULTAT: $ok OK / $fail ECHEC" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================" -ForegroundColor Green
