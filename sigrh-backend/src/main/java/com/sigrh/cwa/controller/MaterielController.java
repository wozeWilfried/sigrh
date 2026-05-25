package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.MaterielService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/materiel")
@RequiredArgsConstructor
public class MaterielController {

    private final MaterielService materielService;

    // ─── CATÉGORIES ─────────────────────────────────

    // ─── ÉQUIPEMENTS ─────────────────────────────────

    // ─── ATTRIBUTIONS ───────────────────────────────

    @GetMapping("/attributions")
    public ResponseEntity<List<Map<String, Object>>> findAllAttributions(
            @RequestParam(required = false) Long materielId,
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) Boolean retourne) {
        return ResponseEntity.ok(materielService.findAllAttributions(materielId, employeId, retourne));
    }

    @PostMapping("/attributions")
    public ResponseEntity<Map<String, Object>> assignerMateriel(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materielService.assignerMateriel(data));
    }

    @PutMapping("/attributions/{id}/retour")
    public ResponseEntity<Map<String, Object>> retournerMateriel(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.retournerMateriel(id));
    }
}
