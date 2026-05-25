package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import com.sigrh.cwa.enums.TypeAlerte;
import com.sigrh.cwa.enums.NiveauAlerte;
import java.time.LocalDate;

@Entity
@Table(name = "alertes_rh")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AlerteRH {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges", "user", "departement"})
    private Employe employe;

    @Enumerated(EnumType.STRING)
    private TypeAlerte type;

    @Enumerated(EnumType.STRING)
    private NiveauAlerte niveau;

    private String message;
    private Double scoreRisque;
    private LocalDate dateAlerte;
    private boolean traitee = false;
}
