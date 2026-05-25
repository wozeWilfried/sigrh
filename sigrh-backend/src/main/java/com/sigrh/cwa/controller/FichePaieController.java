package com.sigrh.cwa.controller;

import com.sigrh.cwa.entity.FichePaie;
import com.sigrh.cwa.service.FichePaieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fiches-paie")
@RequiredArgsConstructor
public class FichePaieController {

    private final FichePaieService fichePaieService;

    @GetMapping
    public ResponseEntity<List<FichePaie>> findAll() {
        return ResponseEntity.ok(fichePaieService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FichePaie> findById(@PathVariable Long id) {
        return ResponseEntity.ok(fichePaieService.findById(id));
    }

    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<FichePaie>> findByEmployeId(@PathVariable Long employeId) {
        return ResponseEntity.ok(fichePaieService.findByEmployeId(employeId));
    }

    @PostMapping
    public ResponseEntity<FichePaie> create(@RequestBody FichePaie fichePaie) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fichePaieService.create(fichePaie));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FichePaie> update(@PathVariable Long id, @RequestBody FichePaie fichePaie) {
        return ResponseEntity.ok(fichePaieService.update(id, fichePaie));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fichePaieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
