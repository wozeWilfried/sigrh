package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "attributions_materiel")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AttributionMateriel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "materiel_id")
    @JsonIgnoreProperties({"attributions", "categorie", "employe", "departement"})
    private Materiel materiel;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges", "user", "departement"})
    private Employe employe;

    @Column(nullable = false)
    private LocalDate dateAttribution;

    private LocalDate dateRetour;

    private String motif;

    private boolean retourne;
}
