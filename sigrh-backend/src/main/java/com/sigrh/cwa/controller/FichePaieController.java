package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.FichePaieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/paie")
@RequiredArgsConstructor
public class FichePaieController {

    private final FichePaieService paieService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll(
            @RequestParam(required = false) Long employeId) {
        if (employeId != null) return ResponseEntity.ok(paieService.findByEmployeId(employeId));
        return ResponseEntity.ok(paieService.findAll());
    }

    @PostMapping("/generer")
    public ResponseEntity<Map<String, Object>> generer(@RequestBody Map<String, Object> body) {
        Long employeId = Long.valueOf(body.get("employeId").toString());
        int mois  = Integer.parseInt(body.get("mois").toString());
        int annee = Integer.parseInt(body.get("annee").toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(paieService.generer(employeId, mois, annee));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<Map<String, Object>> valider(@PathVariable Long id) {
        return ResponseEntity.ok(paieService.valider(id));
    }
}
