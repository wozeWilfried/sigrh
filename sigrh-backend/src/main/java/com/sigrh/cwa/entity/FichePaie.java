package com.sigrh.cwa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Entité représentant une fiche de paie mensuelle.
 * Contient le détail du salaire (brut, retenues, net) pour un employé.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Entity
@Table(name = "fiches_paie")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FichePaie {

    /** Identifiant unique */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Employé concerné */
    @ManyToOne
    @JoinColumn(name = "employe_id")
    @JsonIgnoreProperties({"fichesPaie", "presences", "conges"})
    private Employe employe;

    /** Mois de la fiche (1-12) */
    private Integer mois;

    /** Année de la fiche */
    private Integer annee;

    /** Salaire brut */
    private Double salaireBrut;

    /** Cotisations CNPS */
    private Double cotisationsCNPS;

    /** Impôt IRPP */
    private Double impotIRPP;

    /** Autres retenues */
    private Double autresRetenues;

    /** Primes et bonus */
    private Double primes;

    /** Salaire net après retenues */
    private Double salaireNet;

    /** Date de génération */
    private LocalDate dateGeneration;

    /** Fiche validée pour distribution */
    private boolean valide = false;
}
