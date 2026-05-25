$BASE = "http://localhost:8080"
$ok = 0; $fail = 0

function T($name, $token, $method, $url, $body, $expected) {
    $h = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $h2 = @{"Authorization" = "Bearer $token"}
    try {
        if ($body) { $r = Invoke-WebRequest -Uri $url -Method $method -Headers $h -Body $body -UseBasicParsing -TimeoutSec 10 }
        else { $r = Invoke-WebRequest -Uri $url -Method $method -Headers $h2 -UseBasicParsing -TimeoutSec 10 }
        $sc = $r.StatusCode
        if ($sc -eq $expected) { Write-Host "  OK $sc $name"; $script:ok++ }
        else { Write-Host "  FAIL $sc $name (expected $expected)"; $script:fail++ }
    } catch {
        try { $sc = $_.Exception.Response.StatusCode.value__ } catch { $sc = "ERR" }
        if ($sc -eq $expected) { Write-Host "  OK $sc $name"; $script:ok++ }
        else { Write-Host "  FAIL $sc $name (expected $expected got $sc)"; $script:fail++ }
    }
}

# Login for each role
$adminToken = (Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -TimeoutSec 10).token
$rhToken = (Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"rh","password":"rh123"}' -TimeoutSec 10).token
$mgrToken = (Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"manager","password":"manager123"}' -TimeoutSec 10).token
$empToken = (Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"employe","password":"employe123"}' -TimeoutSec 10).token

Write-Host "`n=== ADMIN peut tout faire ===" -ForegroundColor Green
T "GET employes" $adminToken "GET" "$BASE/api/employes" $null 200
T "GET employe/1" $adminToken "GET" "$BASE/api/employes/1" $null 200
T "POST employe" $adminToken "POST" "$BASE/api/employes" '{"matricule":"T001","nom":"Test","prenom":"T","email":"t@t.com","poste":"Dev","salaire":500000,"departementId":1,"statut":"ACTIF"}' 201
T "DELETE employe" $adminToken "DELETE" "$BASE/api/employes/6" $null 204
T "GET departements" $adminToken "GET" "$BASE/api/departements" $null 200
T "GET materiel" $adminToken "GET" "$BASE/api/materiel" $null 200
T "GET dashboard" $adminToken "GET" "$BASE/api/dashboard" $null 200
T "GET search" $adminToken "GET" "$BASE/api/search?q=admin" $null 200
T "GET analyse" $adminToken "GET" "$BASE/api/analyse/dashboard" $null 200
T "POST paie/generer" $adminToken "POST" "$BASE/api/paie/generer" '{"employeId":1,"mois":1,"annee":2025}' 201
T "PUT conges/valider" $adminToken "PUT" "$BASE/api/conges/1/valider" '{"statut":"APPROUVE","commentaireRH":"OK"}' 200

Write-Host "`n=== RH peut tout faire (sauf DELETE) ===" -ForegroundColor Cyan
T "GET employes" $rhToken "GET" "$BASE/api/employes" $null 200
T "GET employe/1" $rhToken "GET" "$BASE/api/employes/1" $null 200
T "POST employe" $rhToken "POST" "$BASE/api/employes" '{"matricule":"T002","nom":"Test2","prenom":"R","email":"r@t.com","poste":"Dev","salaire":500000,"departementId":1,"statut":"ACTIF"}' 201
T "DELETE employe (REFUSED)" $rhToken "DELETE" "$BASE/api/employes/7" $null 403
T "GET departements" $rhToken "GET" "$BASE/api/departements" $null 200
T "GET materiel" $rhToken "GET" "$BASE/api/materiel" $null 200
T "GET dashboard" $rhToken "GET" "$BASE/api/dashboard" $null 200
T "GET search" $rhToken "GET" "$BASE/api/search?q=admin" $null 200
T "GET analyse" $rhToken "GET" "$BASE/api/analyse/dashboard" $null 200
T "POST paie/generer" $rhToken "POST" "$BASE/api/paie/generer" '{"employeId":1,"mois":2,"annee":2025}' 201

Write-Host "`n=== MANAGER voit son département ===" -ForegroundColor Yellow
T "GET employes (dept IT)" $mgrToken "GET" "$BASE/api/employes" $null 200
T "GET employe/4 (IT=ok)" $mgrToken "GET" "$BASE/api/employes/4" $null 200
T "GET employe/5 (compta=refused)" $mgrToken "GET" "$BASE/api/employes/5" $null 403
T "POST conges IT" $mgrToken "POST" "$BASE/api/conges" '{"employeId":4,"type":"ANNUEL","dateDebut":"2025-07-01","dateFin":"2025-07-15","motif":"Vacances"}' 201
T "POST conges compta (refused)" $mgrToken "POST" "$BASE/api/conges" '{"employeId":5,"type":"ANNUEL","dateDebut":"2025-08-01","dateFin":"2025-08-15","motif":"Vacances"}' $null 403
T "POST materiel (refused)" $mgrToken "POST" "$BASE/api/materiel" '{"nom":"Test"}' $null 403
T "GET dashboard (refused)" $mgrToken "GET" "$BASE/api/dashboard" $null 403
T "GET analyse (refused)" $mgrToken "GET" "$BASE/api/analyse/dashboard" $null 403

Write-Host "`n=== EMPLOYE voit seulement ses données ===" -ForegroundColor Magenta
T "GET employes (only self)" $empToken "GET" "$BASE/api/employes" $null 200
T "GET employe/1 (refused)" $empToken "GET" "$BASE/api/employes/1" $null 403
T "GET employe/4 (self=ok)" $empToken "GET" "$BASE/api/employes/4" $null 200
T "POST conges self" $empToken "POST" "$BASE/api/conges" '{"employeId":4,"type":"ANNUEL","dateDebut":"2025-09-01","dateFin":"2025-09-15","motif":"Vacances"}' 201
T "POST conges other (refused)" $empToken "POST" "$BASE/api/conges" '{"employeId":1,"type":"ANNUEL","dateDebut":"2025-09-01","dateFin":"2025-09-15","motif":"Vacances"}' $null 403
T "POST presences self" $empToken "POST" "$BASE/api/presences" '{"employeId":4,"date":"2025-05-25","statut":"PRESENT"}' 201
T "POST materiel (refused)" $empToken "POST" "$BASE/api/materiel" '{"nom":"Test"}' $null 403
T "GET dashboard (refused)" $empToken "GET" "$BASE/api/dashboard" $null 403
T "PUT self employe (refused)" $empToken "PUT" "$BASE/api/employes/4" '{"nom":"Updated"}' $null 403
T "DELETE conges self" $empToken "DELETE" "$BASE/api/conges/2" $null 204

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  RESULTAT: $ok OK / $fail ECHEC" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================" -ForegroundColor Green
