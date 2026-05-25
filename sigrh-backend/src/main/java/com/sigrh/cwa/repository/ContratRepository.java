package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.Contrat;
import com.sigrh.cwa.enums.StatutContrat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContratRepository extends JpaRepository<Contrat, Long> {
    List<Contrat> findByEmployeId(Long employeId);
    List<Contrat> findByStatut(StatutContrat statut);
    List<Contrat> findByEmployeIdAndStatut(Long employeId, StatutContrat statut);
}
