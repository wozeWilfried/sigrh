package com.sigrh.cwa.dto;

import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CongeDTO {
    private Long id;
    private Long employeId;
    private String employeNom;
    private String type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer nombreJours;
    private String motif;
    private String statut;
    private String commentaireRH;
}
