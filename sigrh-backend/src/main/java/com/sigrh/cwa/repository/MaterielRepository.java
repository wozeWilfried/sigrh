package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.Materiel;
import com.sigrh.cwa.enums.StatutMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterielRepository extends JpaRepository<Materiel, Long> {
    List<Materiel> findByStatut(StatutMateriel statut);
    List<Materiel> findByCategorieId(Long categorieId);
    List<Materiel> findByEmployeId(Long employeId);
    List<Materiel> findByDepartementId(Long departementId);
    long countByStatut(StatutMateriel statut);
}
