package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.AttributionMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttributionMaterielRepository extends JpaRepository<AttributionMateriel, Long> {
    List<AttributionMateriel> findByMaterielId(Long materielId);
    List<AttributionMateriel> findByEmployeId(Long employeId);
    List<AttributionMateriel> findByRetourne(boolean retourne);
    Optional<AttributionMateriel> findByMaterielIdAndRetourne(Long materielId, boolean retourne);
}
