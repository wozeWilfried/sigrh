package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enums.StatutConge;
import com.sigrh.cwa.enums.TypeConge;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CongeRepository extends JpaRepository<Conge, Long> {
    List<Conge> findByEmployeId(Long employeId);
    List<Conge> findByStatut(StatutConge statut);
    List<Conge> findByEmployeIdAndTypeAndStatut(Long employeId, TypeConge type, StatutConge statut);
}
