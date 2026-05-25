package com.sigrh.cwa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import com.sigrh.cwa.enums.Genre;
import com.sigrh.cwa.enums.StatutEmploye;

@Entity
@Table(name = "employes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Employe {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String matricule;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;

    @Enumerated(EnumType.STRING)
    private Genre genre;

    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private String poste;
    private Double salaire;
    private String photoUrl;

    @ManyToOne
    @JoinColumn(name = "departement_id")
    private Departement departement;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private StatutEmploye statut; // ACTIF, INACTIF, SUSPENDU
}
