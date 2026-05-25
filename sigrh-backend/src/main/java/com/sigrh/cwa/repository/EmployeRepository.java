package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.enums.StatutEmploye;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeRepository extends JpaRepository<Employe, Long> {
    List<Employe> findByDepartementId(Long departementId);
    List<Employe> findByStatut(StatutEmploye statut);

    // Recherche globale (nom, email, poste, numéro)
    @Query("SELECT e FROM Employe e WHERE " +
           "LOWER(e.nom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.matricule) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.poste) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Employe> search(@Param("q") String query);

    boolean existsByMatricule(String matricule);
    boolean existsByEmail(String email);
}
