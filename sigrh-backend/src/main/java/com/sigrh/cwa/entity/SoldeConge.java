package com.sigrh.cwa.entity;

import com.sigrh.cwa.enums.TypeConge;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "soldes_conges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employe_id", "annee", "type"})
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SoldeConge {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id")
    private Employe employe;

    private int annee;

    @Enumerated(EnumType.STRING)
    private TypeConge type;

    private int joursAcquis;
    private int joursConsommes;
    private int joursReportes;

    @Builder.Default
    private LocalDate dateCreation = LocalDate.now();

    private LocalDate dateMiseAJour;

    public int getJoursRestants() {
        return joursAcquis + joursReportes - joursConsommes;
    }
}