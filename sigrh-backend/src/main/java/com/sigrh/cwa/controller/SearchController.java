package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Contrôleur REST pour la recherche globale multi-critères.
 * Permet de rechercher dans tous les types de données de l'application.
 * 
 * Point de terminaison: /api/search
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    /**
     * Effectue une recherche globale multi-critères.
     * 
     * @param q Texte de recherche
     * @param page Numéro de page (défaut: 0)
     * @param size Taille des résultats (défaut: 50)
     * @param type Type d'entité à chercher (optionnel)
     * @return Résultats de recherche paginés
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(searchService.searchGlobal(q, page, size, type));
    }
}
