package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/presences")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(presenceService.findAll(date));
    }

    @GetMapping("/employe/{id}")
    public ResponseEntity<List<Map<String, Object>>> findByEmploye(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(presenceService.findByEmploye(id, debut, fin));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> pointer(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presenceService.pointer(data));
    }

    @GetMapping("/rapport/{employeId}")
    public ResponseEntity<Map<String, Object>> rapport(
            @PathVariable Long employeId,
            @RequestParam int mois,
            @RequestParam int annee) {
        return ResponseEntity.ok(presenceService.getRapportMensuel(employeId, mois, annee));
    }
}
