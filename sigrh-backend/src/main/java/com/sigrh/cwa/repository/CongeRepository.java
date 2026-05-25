package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enum.StatutConge;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CongeRepository extends JpaRepository<Conge, Long> {
    List<Conge> findByEmployeId(Long employeId);
    List<Conge> findByStatut(StatutConge statut);
}
