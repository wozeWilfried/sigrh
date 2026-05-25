package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.EmployeDTO;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;

    public Map<String, Object> searchGlobal(String query) {
        Map<String, Object> results = new HashMap<>();

        // Recherche employés
        List<Map<String, Object>> employes = employeRepo.search(query).stream()
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", e.getId());
                m.put("nom", e.getNom() + " " + e.getPrenom());
                m.put("matricule", e.getMatricule());
                m.put("poste", e.getPoste());
                m.put("type", "employe");
                return m;
            }).collect(Collectors.toList());

        // Recherche départements
        List<Map<String, Object>> depts = deptRepo.findAll().stream()
            .filter(d -> d.getNom().toLowerCase().contains(query.toLowerCase()))
            .map(d -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", d.getId());
                m.put("nom", d.getNom());
                m.put("type", "departement");
                return m;
            }).collect(Collectors.toList());

        results.put("employes", employes);
        results.put("departements", depts);
        results.put("total", employes.size() + depts.size());
        return results;
    }
}
