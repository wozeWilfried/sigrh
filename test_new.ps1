$BASE = "http://localhost:8080"
$token = (Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -TimeoutSec 10).token
$h = @{"Authorization" = "Bearer $token"}
$jh = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
$ok = 0; $fail = 0

function T($name, $method, $url, $body, $expected) {
    try {
        if ($body) { $r = Invoke-WebRequest -Uri $url -Method $method -Headers $jh -Body $body -UseBasicParsing -TimeoutSec 10 }
        else { $r = Invoke-WebRequest -Uri $url -Method $method -Headers $h -UseBasicParsing -TimeoutSec 10 }
        $sc = if ($r.StatusCode -eq $expected) { "OK" } else { "FAIL" }
        Write-Host "  $sc $($r.StatusCode) $name"
        if ($sc -eq "OK") { $script:ok++ } else { $script:fail++ }
        return $r.Content
    } catch {
        try { $sc = $_.Exception.Response.StatusCode.value__ } catch { $sc = "ERR" }
        Write-Host "  FAIL $sc $name"; $script:fail++
        return $null
    }
}

Write-Host "=== NOUVEAU: MATERIEL ===" -ForegroundColor Cyan

# Categories
Write-Host "-- Categories --" -ForegroundColor Yellow
T "POST /api/materiel/categories (Informatique)" "POST" "$BASE/api/materiel/categories" '{"nom":"Informatique","description":"Ordinateurs, périphériques"}' 201
T "POST /api/materiel/categories (Mobilier)" "POST" "$BASE/api/materiel/categories" '{"nom":"Mobilier","description":"Bureaux, chaises"}' 201
T "GET /api/materiel/categories" "GET" "$BASE/api/materiel/categories" $null 200
T "GET /api/materiel/categories/1" "GET" "$BASE/api/materiel/categories/1" $null 200
T "PUT /api/materiel/categories/1" "PUT" "$BASE/api/materiel/categories/1" '{"nom":"Informatique Upd"}' 200

# Matériel
Write-Host "-- Materiel --" -ForegroundColor Yellow
T "POST /api/materiel (PC Portable)" "POST" "$BASE/api/materiel" '{"code":"PC-001","nom":"PC Portable Dell","description":"Latitude 5420","categorieId":1,"statut":"DISPONIBLE","quantite":1,"numeroSerie":"SN123456","dateAcquisition":"2024-01-15","valeurAchat":1500000,"departementId":1}' 201
T "POST /api/materiel (PC Fixe)" "POST" "$BASE/api/materiel" '{"code":"PC-002","nom":"PC Fixe HP","categorieId":1,"statut":"DISPONIBLE","quantite":1,"numeroSerie":"SN789012","departementId":1}' 201
T "GET /api/materiel" "GET" "$BASE/api/materiel" $null 200
T "GET /api/materiel?categorieId=1" "GET" "$BASE/api/materiel?categorieId=1" $null 200
T "GET /api/materiel?statut=DISPONIBLE" "GET" "$BASE/api/materiel?statut=DISPONIBLE" $null 200
T "GET /api/materiel?q=Dell" "GET" "$BASE/api/materiel?q=Dell" $null 200
T "GET /api/materiel/1" "GET" "$BASE/api/materiel/1" $null 200
T "PUT /api/materiel/1" "PUT" "$BASE/api/materiel/1" '{"nom":"PC Portable Dell XPS"}' 200
T "GET /api/materiel/stats" "GET" "$BASE/api/materiel/stats" $null 200

# Attributions
Write-Host "-- Attributions --" -ForegroundColor Yellow
T "POST /api/materiel/attributions" "POST" "$BASE/api/materiel/attributions" '{"materielId":1,"employeId":1,"motif":"Mission"}' 201
T "GET /api/materiel/attributions" "GET" "$BASE/api/materiel/attributions" $null 200
T "GET /api/materiel/attributions?employeId=1" "GET" "$BASE/api/materiel/attributions?employeId=1" $null 200
T "PUT /api/materiel/attributions/1/retour" "PUT" "$BASE/api/materiel/attributions/1/retour" $null 200

# Delete
T "DELETE /api/materiel/2" "DELETE" "$BASE/api/materiel/2" $null 204
T "DELETE /api/materiel/categories/2" "DELETE" "$BASE/api/materiel/categories/2" $null 204

Write-Host "`n=== NOUVEAU: RECHERCHE AMELIOREE ===" -ForegroundColor Cyan
T "GET /api/search?q=admin" "GET" "$BASE/api/search?q=admin" $null 200
T "GET /api/search?q=Dell&type=materiel" "GET" "$BASE/api/search?q=Dell&type=materiel" $null 200
T "GET /api/search?q=IT&type=departements" "GET" "$BASE/api/search?q=IT&type=departements" $null 200

Write-Host "`n=== NOUVEAU: DASHBOARD ===" -ForegroundColor Cyan
T "GET /api/dashboard" "GET" "$BASE/api/dashboard" $null 200

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  RESULTAT: $ok OK / $fail ECHEC" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================" -ForegroundColor Green
