package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.Contrat;
import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.enums.StatutContrat;
import com.sigrh.cwa.enums.TypeContrat;
import com.sigrh.cwa.repository.ContratRepository;
import com.sigrh.cwa.repository.EmployeRepository;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratService {

    private final ContratRepository contratRepo;
    private final EmployeRepository employeRepo;
    private final SecurityHelper securityHelper;

    public List<Map<String, Object>> findAll(Long employeId, String statut) {
        List<Contrat> contrats;
        if (employeId != null) {
            securityHelper.canAccessEmploye(employeId);
            contrats = statut != null
                ? contratRepo.findByEmployeIdAndStatut(employeId, StatutContrat.valueOf(statut))
                : contratRepo.findByEmployeId(employeId);
        } else {
            contrats = statut != null
                ? contratRepo.findByStatut(StatutContrat.valueOf(statut))
                : contratRepo.findAll();
        }
        return contrats.stream().map(this::toMap).collect(Collectors.toList());
    }

    public Map<String, Object> findById(Long id) {
        return toMap(contratRepo.findById(id).orElseThrow());
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> data) {
        Employe emp = employeRepo.findById(((Number) data.get("employeId")).longValue()).orElseThrow();
        Contrat c = new Contrat();
        c.setReference((String) data.get("reference"));
        c.setEmploye(emp);
        c.setType(TypeContrat.valueOf((String) data.get("type")));
        c.setDateDebut(LocalDate.parse((String) data.get("dateDebut")));
        if (data.containsKey("dateFin") && data.get("dateFin") != null) {
            c.setDateFin(LocalDate.parse((String) data.get("dateFin")));
        }
        if (data.containsKey("salaire") && data.get("salaire") != null) {
            c.setSalaire(((Number) data.get("salaire")).doubleValue());
        }
        c.setPoste((String) data.getOrDefault("poste", emp.getPoste()));
        c.setStatut(StatutContrat.ACTIF);
        if (data.containsKey("dateSignature") && data.get("dateSignature") != null) {
            c.setDateSignature(LocalDate.parse((String) data.get("dateSignature")));
        }
        c.setDescription((String) data.get("description"));
        return toMap(contratRepo.save(c));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> data) {
        Contrat c = contratRepo.findById(id).orElseThrow();
        if (data.containsKey("reference")) c.setReference((String) data.get("reference"));
        if (data.containsKey("type")) c.setType(TypeContrat.valueOf((String) data.get("type")));
        if (data.containsKey("dateDebut")) c.setDateDebut(LocalDate.parse((String) data.get("dateDebut")));
        if (data.containsKey("dateFin")) c.setDateFin(data.get("dateFin") != null ? LocalDate.parse((String) data.get("dateFin")) : null);
        if (data.containsKey("salaire")) c.setSalaire(((Number) data.get("salaire")).doubleValue());
        if (data.containsKey("poste")) c.setPoste((String) data.get("poste"));
        if (data.containsKey("statut")) c.setStatut(StatutContrat.valueOf((String) data.get("statut")));
        if (data.containsKey("dateSignature")) c.setDateSignature(data.get("dateSignature") != null ? LocalDate.parse((String) data.get("dateSignature")) : null);
        if (data.containsKey("description")) c.setDescription((String) data.get("description"));
        return toMap(contratRepo.save(c));
    }

    @Transactional
    public void delete(Long id) {
        contratRepo.deleteById(id);
    }

    @Transactional
    public Map<String, Object> terminer(Long id) {
        Contrat c = contratRepo.findById(id).orElseThrow();
        c.setStatut(StatutContrat.TERMINE);
        c.setDateFin(LocalDate.now());
        return toMap(contratRepo.save(c));
    }

    public Map<String, Object> getStats() {
        List<Contrat> all = contratRepo.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", all.size());
        stats.put("actifs", all.stream().filter(c -> c.getStatut() == StatutContrat.ACTIF).count());
        stats.put("termines", all.stream().filter(c -> c.getStatut() == StatutContrat.TERMINE).count());
        stats.put("resilies", all.stream().filter(c -> c.getStatut() == StatutContrat.RESILIE).count());
        Map<String, Long> parType = all.stream()
            .collect(Collectors.groupingBy(c -> c.getType().name(), Collectors.counting()));
        stats.put("parType", parType);
        return stats;
    }

    private Map<String, Object> toMap(Contrat c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("reference", c.getReference());
        m.put("employeId", c.getEmploye().getId());
        m.put("employeNom", c.getEmploye().getNom() + " " + c.getEmploye().getPrenom());
        m.put("type", c.getType().name());
        m.put("dateDebut", c.getDateDebut());
        m.put("dateFin", c.getDateFin());
        m.put("salaire", c.getSalaire());
        m.put("poste", c.getPoste());
        m.put("statut", c.getStatut().name());
        m.put("dateSignature", c.getDateSignature());
        m.put("description", c.getDescription());
        return m;
    }
}
