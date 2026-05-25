package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.CategorieMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategorieMaterielRepository extends JpaRepository<CategorieMateriel, Long> {
}
