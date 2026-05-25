package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Entité représentant l'attribution d'un matériel à un employé.
 * Enregistre la date d'attribution, de retour et le motif.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "attributions_materiel")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AttributionMateriel {
    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Matériel attribué */
    @ManyToOne
    @JoinColumn(name = "materiel_id")
    @JsonIgnoreProperties({"attributions", "categorie", "employe", "departement"})
    private Materiel materiel;

    /** Employé bénéficiaire */
    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges", "user", "departement"})
    private Employe employe;

    /** Date d'attribution */
    @Column(nullable = false)
    private LocalDate dateAttribution;

    /** Date de retour (optionnel) */
    private LocalDate dateRetour;

    /** Motif de l'attribution */
    private String motif;

    /** Indique si le matériel a été retourné */
    private boolean retourne;
}
