package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enums.NiveauAlerte;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlerteRHRepository extends JpaRepository<AlerteRH, Long> {
    List<AlerteRH> findByTraitee(boolean traitee);
    List<AlerteRH> findByEmployeId(Long employeId);
    List<AlerteRH> findByNiveau(NiveauAlerte niveau);
    long countByTraitee(boolean traitee);
}
