package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.Departement;
import com.sigrh.cwa.repository.DepartementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartementService {

    private final DepartementRepository departementRepo;

    public List<Map<String, Object>> findAll() {
        return departementRepo.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> create(Map<String, String> data) {
        if (departementRepo.existsByNom(data.get("nom")))
            throw new IllegalStateException("Département déjà existant");
        Departement d = Departement.builder()
            .nom(data.get("nom"))
            .description(data.get("description"))
            .responsable(data.get("responsable"))
            .build();
        return toMap(departementRepo.save(d));
    }

    public Map<String, Object> update(Long id, Map<String, String> data) {
        Departement d = departementRepo.findById(id).orElseThrow();
        d.setNom(data.get("nom"));
        d.setDescription(data.get("description"));
        d.setResponsable(data.get("responsable"));
        return toMap(departementRepo.save(d));
    }

    public void delete(Long id) { 
        departementRepo.deleteById(id); 
    }

    private Map<String, Object> toMap(Departement d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("nom", d.getNom());
        m.put("description", d.getDescription());
        m.put("responsable", d.getResponsable());
        m.put("nombreEmployes", d.getEmployes() != null ? d.getEmployes().size() : 0);
        return m;
    }
}
