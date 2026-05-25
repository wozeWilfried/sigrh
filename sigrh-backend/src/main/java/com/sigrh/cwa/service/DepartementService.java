package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.Departement;
import com.sigrh.cwa.repository.DepartementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartementService {

    private final DepartementRepository departementRepo;

    public List<Departement> findAll() {
        return departementRepo.findAll();
    }

    public Departement findById(Long id) {
        return departementRepo.findById(id).orElseThrow();
    }

    public Departement create(Departement departement) {
        return departementRepo.save(departement);
    }

    public Departement update(Long id, Departement departement) {
        Departement existing = departementRepo.findById(id).orElseThrow();
        existing.setNom(departement.getNom());
        existing.setDescription(departement.getDescription());
        existing.setResponsable(departement.getResponsable());
        return departementRepo.save(existing);
    }

    public void delete(Long id) {
        departementRepo.deleteById(id);
    }
}
