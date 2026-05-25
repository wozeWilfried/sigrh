package com.sigrh.cwa.controller;

import com.sigrh.cwa.entity.Departement;
import com.sigrh.cwa.service.DepartementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departements")
@RequiredArgsConstructor
public class DepartementController {

    private final DepartementService departementService;

    @GetMapping
    public ResponseEntity<List<Departement>> findAll() {
        return ResponseEntity.ok(departementService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Departement> findById(@PathVariable Long id) {
        return ResponseEntity.ok(departementService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Departement> create(@RequestBody Departement departement) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departementService.create(departement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Departement> update(@PathVariable Long id, @RequestBody Departement departement) {
        return ResponseEntity.ok(departementService.update(id, departement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        departementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
