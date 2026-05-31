package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PresenceRepository extends JpaRepository<Presence, Long> {
    List<Presence> findByEmployeIdAndDateBetween(Long id, LocalDate debut, LocalDate fin);
    List<Presence> findByDate(LocalDate date);
    Optional<Presence> findByEmployeIdAndDate(Long employeId, LocalDate date);
}
