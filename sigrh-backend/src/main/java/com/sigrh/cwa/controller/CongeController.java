package com.sigrh.cwa.controller;

import com.sigrh.cwa.dto.CongeDTO;
import com.sigrh.cwa.service.CongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/conges")
@RequiredArgsConstructor
public class CongeController {

    private final CongeService congeService;

    @GetMapping
    public ResponseEntity<List<CongeDTO>> findAll() {
        return ResponseEntity.ok(congeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CongeDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(congeService.findById(id));
    }

    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<CongeDTO>> findByEmployeId(@PathVariable Long employeId) {
        return ResponseEntity.ok(congeService.findByEmployeId(employeId));
    }

    @PostMapping
    public ResponseEntity<CongeDTO> create(@RequestBody CongeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(congeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CongeDTO> update(@PathVariable Long id, @RequestBody CongeDTO dto) {
        return ResponseEntity.ok(congeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        congeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<CongeDTO> valider(@PathVariable Long id, @RequestBody CongeDTO dto) {
        return ResponseEntity.ok(congeService.validerConge(id, dto));
    }
}
