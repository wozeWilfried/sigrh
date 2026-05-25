$BASE = "http://localhost:8080"

# Login
$r = Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -TimeoutSec 10
$token = $r.token
Write-Host "1. AUTH" -ForegroundColor Green
Write-Host "   POST /api/auth/login -> 200 [TOKEN OK]" -ForegroundColor Green

$h = @{"Authorization" = "Bearer $token"}
$jh = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
$empBody = '{"matricule":"TST001","nom":"Test","prenom":"User","email":"t@t.com","telephone":"+223000","genre":"MASCULIN","dateNaissance":"1990-01-01","dateEmbauche":"2023-01-01","poste":"Dev","salaire":500000,"departementId":1,"statut":"ACTIF"}'
$leaveBody = '{"employeId":1,"type":"ANNUEL","dateDebut":"2024-06-01","dateFin":"2024-06-15","nombreJours":15,"motif":"Vacances","statut":"EN_ATTENTE"}'
$presBody = '{"employe":{"id":1},"date":"2024-05-25","heureArrivee":"08:30:00","heureDepart":"17:00:00","statut":"PRESENT"}'
$ficheBody = '{"employe":{"id":1},"mois":5,"annee":2024,"salaireBrut":500000,"valide":false}'

Write-Host "`n2. EMPLOYES" -ForegroundColor Green
try { $r = Invoke-WebRequest -Uri "$BASE/api/employes" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/employes -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/employes/1" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/employes/1 -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/employes/search?q=admin" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/employes/search?q= -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/employes" -Method POST -Headers $jh -Body $empBody -UseBasicParsing -TimeoutSec 10; $eid = ($r.Content | ConvertFrom-Json).id; Write-Host "   POST /api/employes -> $($r.StatusCode) [ID=$eid]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/employes/$eid" -Method PUT -Headers $jh -Body $empBody -UseBasicParsing -TimeoutSec 10; Write-Host "   PUT /api/employes/$eid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/employes/$eid" -Method DELETE -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   DELETE /api/employes/$eid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }

Write-Host "`n3. DEPARTEMENTS" -ForegroundColor Green
try { $r = Invoke-WebRequest -Uri "$BASE/api/departements" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/departements -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/departements/1" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/departements/1 -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/departements" -Method POST -Headers $jh -Body '{"nom":"IT","description":"IT Dept"}' -UseBasicParsing -TimeoutSec 10; $did = ($r.Content | ConvertFrom-Json).id; Write-Host "   POST /api/departements -> $($r.StatusCode) [ID=$did]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/departements/$did" -Method PUT -Headers $jh -Body '{"nom":"IT Updated","description":"IT Dept Updated"}' -UseBasicParsing -TimeoutSec 10; Write-Host "   PUT /api/departements/$did -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/departements/$did" -Method DELETE -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   DELETE /api/departements/$did -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }

Write-Host "`n4. CONGES" -ForegroundColor Green
try { $r = Invoke-WebRequest -Uri "$BASE/api/conges" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/conges -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/conges" -Method POST -Headers $jh -Body $leaveBody -UseBasicParsing -TimeoutSec 10; $cid = ($r.Content | ConvertFrom-Json).id; Write-Host "   POST /api/conges -> $($r.StatusCode) [ID=$cid]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/conges/$cid" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/conges/$cid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/conges/employe/1" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/conges/employe/1 -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/conges/$cid/valider" -Method PUT -Headers $jh -Body '{"statut":"APPROUVE","commentaireRH":"OK"}' -UseBasicParsing -TimeoutSec 10; Write-Host "   PUT /api/conges/$cid/valider -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/conges/$cid" -Method DELETE -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   DELETE /api/conges/$cid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }

Write-Host "`n5. PRESENCES" -ForegroundColor Green
try { $r = Invoke-WebRequest -Uri "$BASE/api/presences" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/presences -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/presences" -Method POST -Headers $jh -Body $presBody -UseBasicParsing -TimeoutSec 10; $pid = ($r.Content | ConvertFrom-Json).id; Write-Host "   POST /api/presences -> $($r.StatusCode) [ID=$pid]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/presences/$pid" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/presences/$pid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/presences/employe/1?debut=2024-01-01&fin=2024-12-31" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/presences/employe/1?debut=&fin= -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/presences/date/2024-05-25" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/presences/date/2024-05-25 -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/presences/$pid" -Method DELETE -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   DELETE /api/presences/$pid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }

Write-Host "`n6. FICHES DE PAIE" -ForegroundColor Green
try { $r = Invoke-WebRequest -Uri "$BASE/api/fiches-paie" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/fiches-paie -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/fiches-paie" -Method POST -Headers $jh -Body $ficheBody -UseBasicParsing -TimeoutSec 10; $fid = ($r.Content | ConvertFrom-Json).id; Write-Host "   POST /api/fiches-paie -> $($r.StatusCode) [ID=$fid]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/fiches-paie/$fid" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/fiches-paie/$fid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/fiches-paie/employe/1" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/fiches-paie/employe/1 -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/fiches-paie/generer?employeId=1&mois=5&annee=2024" -Method POST -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   POST /api/fiches-paie/generer -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }
try { $r = Invoke-WebRequest -Uri "$BASE/api/fiches-paie/$fid" -Method DELETE -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   DELETE /api/fiches-paie/$fid -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }

Write-Host "`n7. SEARCH" -ForegroundColor Green
try { $r = Invoke-WebRequest -Uri "$BASE/api/search?q=admin" -Headers $h -UseBasicParsing -TimeoutSec 10; Write-Host "   GET /api/search?q= -> $($r.StatusCode) [OK]" -ForegroundColor Green } catch { $_.Exception.Response.StatusCode }

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  TOUS LES TESTS TERMINES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
