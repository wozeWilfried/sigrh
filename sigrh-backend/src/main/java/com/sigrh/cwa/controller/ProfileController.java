package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.ProfilDTO;
import com.sigrh.cwa.dto.ProfilUpdateRequest;
import com.sigrh.cwa.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST du profil personnel.
 * Accessible à tout utilisateur authentifié, quel que soit son rôle.
 *
 * Points de terminaison:
 * - GET  /api/profile : consulter son profil
 * - PUT  /api/profile : personnaliser son profil (téléphone, adresse, email, photo)
 *
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfilDTO> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping
    public ResponseEntity<ProfilDTO> updateMyProfile(@RequestBody ProfilUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }
}