package com.sigrh.cwa.dto;

import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeDTO {
    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String genre;
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private String poste;
    private Double salaire;
    private String photoUrl;
    private Long departementId;
    private String departementNom;
    private String statut;
}
