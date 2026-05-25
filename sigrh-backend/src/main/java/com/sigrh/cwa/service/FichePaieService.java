package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.FichePaie;
import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.repository.FichePaieRepository;
import com.sigrh.cwa.repository.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FichePaieService {

    private final FichePaieRepository fichePaieRepo;
    private final EmployeRepository employeRepo;

    public List<FichePaie> findAll() {
        return fichePaieRepo.findAll();
    }

    public FichePaie findById(Long id) {
        return fichePaieRepo.findById(id).orElseThrow();
    }

    public List<FichePaie> findByEmployeId(Long employeId) {
        return fichePaieRepo.findByEmployeId(employeId);
    }

    public FichePaie create(FichePaie fichePaie) {
        return fichePaieRepo.save(fichePaie);
    }

    public FichePaie update(Long id, FichePaie fichePaie) {
        FichePaie existing = fichePaieRepo.findById(id).orElseThrow();
        existing.setMois(fichePaie.getMois());
        existing.setAnnee(fichePaie.getAnnee());
        existing.setSalaireBrut(fichePaie.getSalaireBrut());
        existing.setCotisationsCNPS(fichePaie.getCotisationsCNPS());
        existing.setImpotIRPP(fichePaie.getImpotIRPP());
        existing.setAutresRetenues(fichePaie.getAutresRetenues());
        existing.setPrimes(fichePaie.getPrimes());
        existing.setSalaireNet(fichePaie.getSalaireNet());
        existing.setValide(fichePaie.isValide());
        return fichePaieRepo.save(existing);
    }

    public void delete(Long id) {
        fichePaieRepo.deleteById(id);
    }

    public FichePaie genererFichePaie(Long employeId, int mois, int annee) {
        Employe employe = employeRepo.findById(employeId).orElseThrow();
        Double salaireBrut = employe.getSalaire() != null ? employe.getSalaire() : 0.0;
        
        FichePaie fichePaie = FichePaie.builder()
            .employe(employe)
            .mois(mois)
            .annee(annee)
            .salaireBrut(salaireBrut)
            .cotisationsCNPS(salaireBrut * 0.08)  // 8% CNPS
            .impotIRPP(salaireBrut * 0.10)        // 10% IRPP
            .autresRetenues(0.0)
            .primes(0.0)
            .salaireNet(salaireBrut - (salaireBrut * 0.08) - (salaireBrut * 0.10))
            .dateGeneration(LocalDate.now())
            .valide(false)
            .build();
        
        return fichePaieRepo.save(fichePaie);
    }
}
