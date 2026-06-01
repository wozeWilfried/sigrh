package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.SoldeConge;
import com.sigrh.cwa.enums.TypeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SoldeCongeRepository extends JpaRepository<SoldeConge, Long> {
    List<SoldeConge> findByEmployeIdAndAnneeAndType(Long employeId, int annee, TypeConge type);
    List<SoldeConge> findByEmployeId(Long employeId);
    List<SoldeConge> findByAnnee(int annee);
}