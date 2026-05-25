package com.sigrh.cwa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;
import com.sigrh.cwa.enum.Role;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN, RH, MANAGER, EMPLOYE

    private boolean active = true;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Employe employe;
}
