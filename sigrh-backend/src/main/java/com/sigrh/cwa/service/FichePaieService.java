package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.FichePaie;
import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.repository.FichePaieRepository;
import com.sigrh.cwa.repository.EmployeRepository;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion des fiches de paie et bulletins de salaire.
 * Permet de:
 * - Générer les fiches de paie mensuelles
 * - Calculer les salaires et retenues
 * - Consulter l'historique de paie
 * - Filtrer l'accès selon les droits de l'utilisateur
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class FichePaieService {

    private final FichePaieRepository fichePaieRepo;
    private final EmployeRepository employeRepo;
    private final SecurityHelper security;

    public List<Map<String, Object>> findAll() {
        List<FichePaie> all = fichePaieRepo.findAll();
        if (security.isAdminOrRh()) {
            return all.stream().map(this::toMap).collect(Collectors.toList());
        }
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return all.stream()
                .filter(f -> f.getEmploye() != null && f.getEmploye().getDepartement() != null
                    && f.getEmploye().getDepartement().getId().equals(deptId))
                .map(this::toMap).collect(Collectors.toList());
        }
        return all.stream()
            .filter(f -> f.getEmploye() != null && f.getEmploye().getId().equals(security.getCurrentEmployeId()))
            .map(this::toMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> findByEmployeId(Long employeId) {
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return fichePaieRepo.findByEmployeId(employeId).stream().map(this::toMap).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> generer(Long employeId, int mois, int annee) {
        fichePaieRepo.findByEmployeIdAndMoisAndAnnee(employeId, mois, annee)
            .ifPresent(f -> { throw new IllegalStateException("Fiche déjà générée pour ce mois"); });
        Employe emp = employeRepo.findById(employeId).orElseThrow();
        double brut = emp.getSalaire() != null ? emp.getSalaire() : 0;
        double cnps = brut * 0.042;
        double irpp = calculerIRPP(brut);
        double net  = brut - cnps - irpp;
        FichePaie fiche = FichePaie.builder()
            .employe(emp).mois(mois).annee(annee)
            .salaireBrut(brut).cotisationsCNPS(cnps).impotIRPP(irpp)
            .autresRetenues(0.0).primes(0.0).salaireNet(net)
            .dateGeneration(LocalDate.now()).valide(false).build();
        return toMap(fichePaieRepo.save(fiche));
    }

    @Transactional
    public Map<String, Object> valider(Long id) {
        FichePaie fiche = fichePaieRepo.findById(id).orElseThrow();
        fiche.setValide(true);
        return toMap(fichePaieRepo.save(fiche));
    }

    private double calculerIRPP(double brut) {
        if (brut <= 62500) return 0;
        if (brut <= 125000) return (brut - 62500) * 0.10;
        if (brut <= 250000) return 6250 + (brut - 125000) * 0.165;
        return 26875 + (brut - 250000) * 0.25;
    }

    private Map<String, Object> toMap(FichePaie f) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", f.getId());
        m.put("employeId", f.getEmploye().getId());
        m.put("employeNom", f.getEmploye().getNom() + " " + f.getEmploye().getPrenom());
        m.put("matricule", f.getEmploye().getMatricule());
        m.put("poste", f.getEmploye().getPoste());
        m.put("mois", f.getMois());
        m.put("annee", f.getAnnee());
        m.put("salaireBrut", f.getSalaireBrut());
        m.put("cotisationsCNPS", f.getCotisationsCNPS());
        m.put("impotIRPP", f.getImpotIRPP());
        m.put("autresRetenues", f.getAutresRetenues());
        m.put("primes", f.getPrimes());
        m.put("salaireNet", f.getSalaireNet());
        m.put("dateGeneration", f.getDateGeneration());
        m.put("valide", f.isValide());
        return m;
    }
}
