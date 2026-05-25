package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.CongeDTO;
import com.sigrh.cwa.service.CongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conges")
@RequiredArgsConstructor
public class CongeController {

    private final CongeService congeService;

    @GetMapping
    public ResponseEntity<List<CongeDTO>> findAll(
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) String statut) {
        if (employeId != null) return ResponseEntity.ok(congeService.findByEmploye(employeId));
        if (statut != null)    return ResponseEntity.ok(congeService.findByStatut(statut));
        return ResponseEntity.ok(congeService.findAll());
    }

    @PostMapping
    public ResponseEntity<CongeDTO> create(@RequestBody CongeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(congeService.create(dto));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<CongeDTO> valider(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(congeService.valider(id, body.get("statut"), body.get("commentaire")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        congeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
