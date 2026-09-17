package com.sigrh.cwa.repository;

import com.sigrh.cwa.entity.User;
import com.sigrh.cwa.enums.Role;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findAllByRoleIn(Collection<Role> roles);
}
