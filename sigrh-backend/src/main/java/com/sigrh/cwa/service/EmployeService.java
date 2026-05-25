package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.EmployeDTO;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.Genre;
import com.sigrh.cwa.enums.StatutEmploye;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository employeRepo;
    private final DepartementRepository deptRepo;

    public List<EmployeDTO> findAll() {
        return employeRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public EmployeDTO findById(Long id) {
        return toDTO(employeRepo.findById(id).orElseThrow());
    }

    public List<EmployeDTO> search(String query) {
        return employeRepo.search(query).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public EmployeDTO create(EmployeDTO dto) {
        Employe e = toEntity(dto);
        return toDTO(employeRepo.save(e));
    }

    public EmployeDTO update(Long id, EmployeDTO dto) {
        Employe existing = employeRepo.findById(id).orElseThrow();
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(dto.getEmail());
        existing.setTelephone(dto.getTelephone());
        existing.setPoste(dto.getPoste());
        existing.setSalaire(dto.getSalaire());
        existing.setStatut(StatutEmploye.valueOf(dto.getStatut()));
        if (dto.getDepartementId() != null) {
            existing.setDepartement(deptRepo.findById(dto.getDepartementId()).orElseThrow());
        }
        return toDTO(employeRepo.save(existing));
    }

    public void delete(Long id) { employeRepo.deleteById(id); }

    private EmployeDTO toDTO(Employe e) {
        return EmployeDTO.builder()
            .id(e.getId()).matricule(e.getMatricule())
            .nom(e.getNom()).prenom(e.getPrenom())
            .email(e.getEmail()).telephone(e.getTelephone())
            .genre(e.getGenre() != null ? e.getGenre().name() : null)
            .dateNaissance(e.getDateNaissance()).dateEmbauche(e.getDateEmbauche())
            .poste(e.getPoste()).salaire(e.getSalaire()).photoUrl(e.getPhotoUrl())
            .departementId(e.getDepartement() != null ? e.getDepartement().getId() : null)
            .departementNom(e.getDepartement() != null ? e.getDepartement().getNom() : null)
            .statut(e.getStatut() != null ? e.getStatut().name() : null)
            .build();
    }

    private Employe toEntity(EmployeDTO dto) {
        Employe e = new Employe();
        e.setMatricule(dto.getMatricule());
        e.setNom(dto.getNom()); e.setPrenom(dto.getPrenom());
        e.setEmail(dto.getEmail()); e.setTelephone(dto.getTelephone());
        if (dto.getGenre() != null) e.setGenre(Genre.valueOf(dto.getGenre()));
        e.setDateNaissance(dto.getDateNaissance());
        e.setDateEmbauche(dto.getDateEmbauche());
        e.setPoste(dto.getPoste()); e.setSalaire(dto.getSalaire());
        e.setStatut(StatutEmploye.ACTIF);
        if (dto.getDepartementId() != null) {
            e.setDepartement(deptRepo.findById(dto.getDepartementId()).orElseThrow());
        }
        return e;
    }
}
