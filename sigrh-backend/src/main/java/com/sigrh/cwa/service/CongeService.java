package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.CongeDTO;
import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.StatutConge;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CongeService {

    private final CongeRepository congeRepo;
    private final EmployeRepository employeRepo;

    public List<CongeDTO> findAll() {
        return congeRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CongeDTO findById(Long id) {
        return toDTO(congeRepo.findById(id).orElseThrow());
    }

    public List<CongeDTO> findByEmployeId(Long employeId) {
        return congeRepo.findByEmployeId(employeId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CongeDTO create(CongeDTO dto) {
        Conge c = toEntity(dto);
        return toDTO(congeRepo.save(c));
    }

    public CongeDTO update(Long id, CongeDTO dto) {
        Conge existing = congeRepo.findById(id).orElseThrow();
        existing.setType(com.sigrh.cwa.enums.TypeConge.valueOf(dto.getType()));
        existing.setDateDebut(dto.getDateDebut());
        existing.setDateFin(dto.getDateFin());
        existing.setNombreJours(dto.getNombreJours());
        existing.setMotif(dto.getMotif());
        existing.setStatut(StatutConge.valueOf(dto.getStatut()));
        existing.setCommentaireRH(dto.getCommentaireRH());
        return toDTO(congeRepo.save(existing));
    }

    public void delete(Long id) {
        congeRepo.deleteById(id);
    }

    public CongeDTO validerConge(Long id, CongeDTO dto) {
        Conge existing = congeRepo.findById(id).orElseThrow();
        existing.setStatut(StatutConge.valueOf(dto.getStatut()));
        existing.setCommentaireRH(dto.getCommentaireRH());
        return toDTO(congeRepo.save(existing));
    }

    private CongeDTO toDTO(Conge c) {
        return CongeDTO.builder()
            .id(c.getId())
            .employeId(c.getEmploye() != null ? c.getEmploye().getId() : null)
            .employeNom(c.getEmploye() != null ? c.getEmploye().getNom() + " " + c.getEmploye().getPrenom() : null)
            .type(c.getType() != null ? c.getType().name() : null)
            .dateDebut(c.getDateDebut())
            .dateFin(c.getDateFin())
            .nombreJours(c.getNombreJours())
            .motif(c.getMotif())
            .statut(c.getStatut() != null ? c.getStatut().name() : null)
            .commentaireRH(c.getCommentaireRH())
            .build();
    }

    private Conge toEntity(CongeDTO dto) {
        Conge c = new Conge();
        if (dto.getEmployeId() != null) {
            c.setEmploye(employeRepo.findById(dto.getEmployeId()).orElseThrow());
        }
        c.setType(com.sigrh.cwa.enums.TypeConge.valueOf(dto.getType()));
        c.setDateDebut(dto.getDateDebut());
        c.setDateFin(dto.getDateFin());
        c.setNombreJours(dto.getNombreJours());
        c.setMotif(dto.getMotif());
        c.setStatut(StatutConge.valueOf(dto.getStatut()));
        c.setCommentaireRH(dto.getCommentaireRH());
        return c;
    }
}
