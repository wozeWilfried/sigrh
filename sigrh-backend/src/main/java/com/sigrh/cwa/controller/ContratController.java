package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.ContratService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/contrats")
@RequiredArgsConstructor
public class ContratController {

    private final ContratService contratService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll(
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) String statut) {
        return ResponseEntity.ok(contratService.findAll(employeId, statut));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(contratService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contratService.create(data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(contratService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        contratService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Contrat supprimé"));
    }

    @PutMapping("/{id}/terminer")
    public ResponseEntity<Map<String, Object>> terminer(@PathVariable Long id) {
        return ResponseEntity.ok(contratService.terminer(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(contratService.getStats());
    }
}
