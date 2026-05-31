package com.sigrh.cwa.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Gestionnaire global d'exceptions pour l'application.
 * Capture les exceptions et retourne des réponses HTTP avec des messages d'erreur.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Traite les exceptions IllegalStateException (conflits).
     * 
     * @param ex Exception captée
     * @return Réponse 409 Conflict avec message
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(java.util.NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Ressource introuvable"));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(Exception ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Accès refusé"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
