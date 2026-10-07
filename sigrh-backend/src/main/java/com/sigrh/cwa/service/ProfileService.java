package com.sigrh.cwa.service;

import com.sigrh.cwa.dto.ProfilDTO;
import com.sigrh.cwa.dto.ProfilUpdateRequest;
import com.sigrh.cwa.entity.Employe;
import com.sigrh.cwa.entity.User;
import com.sigrh.cwa.repository.EmployeRepository;
import com.sigrh.cwa.repository.UserRepository;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service de gestion du profil de l'utilisateur connecté.
 * Permet à tout utilisateur authentifié de consulter et de personnaliser
 * son propre profil (téléphone, adresse, email, photo) quel que soit son rôle.
 *
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    /** Taille maximale tolérée pour une photo encodée en base64. */
    private static final int MAX_PHOTO_LENGTH = 2_000_000;

    private final SecurityHelper security;
    private final UserRepository userRepo;
    private final EmployeRepository employeRepo;

    /**
     * Retourne le profil de l'utilisateur connecté.
     *
     * @return ProfilDTO du compte courant
     * @throws AccessDeniedException si aucun utilisateur n'est authentifié
     */
    public ProfilDTO getMyProfile() {
        User user = security.getCurrentUser();
        if (user == null) throw new AccessDeniedException("Utilisateur non authentifié");
        return toDTO(user, user.getEmploye());
    }

    /**
     * Met à jour les champs personnalisables du profil courant.
     * Seuls les champs non nuls de la requête sont modifiés.
     *
     * @param request Champs à mettre à jour
     * @return ProfilDTO mis à jour
     */
    @Transactional
    public ProfilDTO updateMyProfile(ProfilUpdateRequest request) {
        User user = security.getCurrentUser();
        if (user == null) throw new AccessDeniedException("Utilisateur non authentifié");

        String newEmail = request.getEmail() != null ? request.getEmail().trim() : null;
        boolean emailChanged = newEmail != null && !newEmail.isBlank()
                && !newEmail.equalsIgnoreCase(user.getEmail());
        if (emailChanged && userRepo.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Cette adresse email est déjà utilisée par un autre compte");
        }

        String photo = request.getPhotoUrl();
        if (photo != null && photo.length() > MAX_PHOTO_LENGTH) {
            throw new IllegalArgumentException("L'image de profil est trop volumineuse");
        }

        Employe employe = user.getEmploye();
        if (employe != null) {
            if (request.getTelephone() != null) employe.setTelephone(request.getTelephone().trim());
            if (request.getAdresse() != null) employe.setAdresse(request.getAdresse().trim());
            if (photo != null) employe.setPhotoUrl(photo.isBlank() ? null : photo);
            if (emailChanged) employe.setEmail(newEmail);
            employeRepo.save(employe);
        }

        if (emailChanged) {
            user.setEmail(newEmail);
            userRepo.save(user);
        }

        return toDTO(user, employe);
    }

    private ProfilDTO toDTO(User user, Employe e) {
        ProfilDTO.ProfilDTOBuilder builder = ProfilDTO.builder()
                .username(user.getUsername())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .email(user.getEmail());

        if (e != null) {
            builder.employeId(e.getId())
                    .nom(e.getNom())
                    .prenom(e.getPrenom())
                    .email(e.getEmail() != null ? e.getEmail() : user.getEmail())
                    .telephone(e.getTelephone())
                    .adresse(e.getAdresse())
                    .photoUrl(e.getPhotoUrl())
                    .poste(e.getPoste())
                    .departementNom(e.getDepartement() != null ? e.getDepartement().getNom() : null)
                    .matricule(e.getMatricule())
                    .statut(e.getStatut() != null ? e.getStatut().name() : null)
                    .genre(e.getGenre() != null ? e.getGenre().name() : null)
                    .dateEmbauche(e.getDateEmbauche())
                    .dateNaissance(e.getDateNaissance());
        }
        return builder.build();
    }
}