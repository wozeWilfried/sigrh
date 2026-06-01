package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.entity.SoldeConge;
import com.sigrh.cwa.enums.StatutConge;
import com.sigrh.cwa.enums.TypeConge;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SoldeCongeService {

    private static final int TAUX_ANNUEL = 30;
    private static final int REPORT_MAX = 5;

    private final SoldeCongeRepository soldeRepo;
    private final EmployeRepository employeRepo;
    private final CongeRepository congeRepo;

    @Transactional
    public SoldeConge initialiserOuObtenir(Long employeId, int annee, TypeConge type) {
        List<SoldeConge> results = soldeRepo.findByEmployeIdAndAnneeAndType(employeId, annee, type);
        if (!results.isEmpty()) {
            // En cas de doublons, fusionner les consommations et supprimer les autres
            SoldeConge first = results.get(0);
            for (int i = 1; i < results.size(); i++) {
                SoldeConge dup = results.get(i);
                first.setJoursConsommes(first.getJoursConsommes() + dup.getJoursConsommes());
                first.setJoursAcquis(Math.max(first.getJoursAcquis(), dup.getJoursAcquis()));
                first.setJoursReportes(Math.max(first.getJoursReportes(), dup.getJoursReportes()));
                soldeRepo.delete(dup);
            }
            soldeRepo.save(first);
            return first;
        }
        return creerSolde(employeId, annee, type);
    }

    private SoldeConge creerSolde(Long employeId, int annee, TypeConge type) {
        Employe employe = employeRepo.findById(employeId)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        int joursReportes = 0;
        if (type == TypeConge.ANNUEL) {
            int anneePrecedente = annee - 1;
            List<SoldeConge> prev = soldeRepo.findByEmployeIdAndAnneeAndType(employeId, anneePrecedente, type);
            if (!prev.isEmpty()) {
                joursReportes = Math.min(prev.get(0).getJoursRestants(), REPORT_MAX);
            }
        }

        int joursAcquis = 0;
        if (type == TypeConge.ANNUEL && employe.getDateEmbauche() != null) {
            int anciennete = Period.between(employe.getDateEmbauche(), LocalDate.of(annee, 1, 1)).getYears();
            int moisEmbaucheApresJanvier = 0;
            if (employe.getDateEmbauche().getYear() == annee) {
                moisEmbaucheApresJanvier = 12 - (employe.getDateEmbauche().getMonthValue() - 1);
                joursAcquis = Math.max(0, moisEmbaucheApresJanvier * TAUX_ANNUEL / 12);
            } else {
                joursAcquis = Math.max(0, anciennete >= 0 ? TAUX_ANNUEL : 0);
            }
        }

        SoldeConge solde = SoldeConge.builder()
            .employe(employe)
            .annee(annee)
            .type(type)
            .joursAcquis(joursAcquis)
            .joursConsommes(0)
            .joursReportes(joursReportes)
            .dateCreation(LocalDate.now())
            .build();

        return soldeRepo.save(solde);
    }

    @Transactional
    public void consommer(Long employeId, TypeConge type, int jours) {
        if (type != TypeConge.ANNUEL) return;
        int annee = LocalDate.now().getYear();
        SoldeConge solde = initialiserOuObtenir(employeId, annee, type);
        solde.setJoursConsommes(solde.getJoursConsommes() + jours);
        solde.setDateMiseAJour(LocalDate.now());
        soldeRepo.save(solde);
    }

    @Transactional
    public void restaurer(Long employeId, TypeConge type, int jours) {
        if (type != TypeConge.ANNUEL) return;
        int annee = LocalDate.now().getYear();
        SoldeConge solde = initialiserOuObtenir(employeId, annee, type);
        solde.setJoursConsommes(Math.max(0, solde.getJoursConsommes() - jours));
        solde.setDateMiseAJour(LocalDate.now());
        soldeRepo.save(solde);
    }

    public int getSoldeDisponible(Long employeId, int annee, TypeConge type) {
        SoldeConge solde = initialiserOuObtenir(employeId, annee, type);
        return solde.getJoursRestants();
    }

    public List<SoldeConge> getSoldesEmploye(Long employeId) {
        return soldeRepo.findByEmployeId(employeId);
    }
}