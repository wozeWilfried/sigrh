package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final PresenceRepository presenceRepo;
    private final EmployeRepository employeRepo;

    public List<Presence> findAll() {
        return presenceRepo.findAll();
    }

    public Presence findById(Long id) {
        return presenceRepo.findById(id).orElseThrow();
    }

    public List<Presence> findByEmployeIdAndDateBetween(Long employeId, LocalDate debut, LocalDate fin) {
        return presenceRepo.findByEmployeIdAndDateBetween(employeId, debut, fin);
    }

    public List<Presence> findByDate(LocalDate date) {
        return presenceRepo.findByDate(date);
    }

    public Presence create(Presence presence) {
        return presenceRepo.save(presence);
    }

    public Presence update(Long id, Presence presence) {
        Presence existing = presenceRepo.findById(id).orElseThrow();
        existing.setDate(presence.getDate());
        existing.setHeureArrivee(presence.getHeureArrivee());
        existing.setHeureDepart(presence.getHeureDepart());
        existing.setStatut(presence.getStatut());
        return presenceRepo.save(existing);
    }

    public void delete(Long id) {
        presenceRepo.deleteById(id);
    }
}
