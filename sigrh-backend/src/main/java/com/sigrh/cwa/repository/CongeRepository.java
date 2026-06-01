package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enums.StatutConge;
import com.sigrh.cwa.enums.TypeConge;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CongeRepository extends JpaRepository<Conge, Long> {
    List<Conge> findByEmployeId(Long employeId);
    List<Conge> findByStatut(StatutConge statut);
    List<Conge> findByEmployeIdAndTypeAndStatut(Long employeId, TypeConge type, StatutConge statut);

    @Query("SELECT c FROM Conge c WHERE c.employe.id = :employeId AND c.statut IN :statuts " +
           "AND c.dateDebut <= :dateFin AND c.dateFin >= :dateDebut")
    List<Conge> findOverlapping(@Param("employeId") Long employeId,
                                @Param("dateDebut") LocalDate dateDebut,
                                @Param("dateFin") LocalDate dateFin,
                                @Param("statuts") List<StatutConge> statuts);
}
