package com.sigrh.cwa.dto;

import lombok.*;

/**
 * Champs que l'utilisateur est autorisé à personnaliser sur son propre profil.
 * Les champs non fournis (null) sont laissés inchangés.
 *
 * @author Équipe SIGRH
 * @version 1.0
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfilUpdateRequest {

    /** Téléphone */
    private String telephone;

    /** Adresse postale */
    private String adresse;

    /** Adresse email (doit rester unique) */
    private String email;

    /** Photo de profil : URL ou data URL base64 */
    private String photoUrl;
}