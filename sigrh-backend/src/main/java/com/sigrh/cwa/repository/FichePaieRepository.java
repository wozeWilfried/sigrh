package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.FichePaie;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FichePaieRepository extends JpaRepository<FichePaie, Long> {
    List<FichePaie> findByEmployeId(Long employeId);
    Optional<FichePaie> findByEmployeIdAndMoisAndAnnee(Long id, int mois, int annee);
}
