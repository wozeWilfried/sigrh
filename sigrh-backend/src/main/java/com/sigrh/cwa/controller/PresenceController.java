package com.sigrh.cwa.controller;

import com.sigrh.cwa.entity.Presence;
import com.sigrh.cwa.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/presences")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping
    public ResponseEntity<List<Presence>> findAll() {
        return ResponseEntity.ok(presenceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Presence> findById(@PathVariable Long id) {
        return ResponseEntity.ok(presenceService.findById(id));
    }

    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<Presence>> findByEmployeId(
            @PathVariable Long employeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(presenceService.findByEmployeIdAndDateBetween(employeId, debut, fin));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Presence>> findByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(presenceService.findByDate(date));
    }

    @PostMapping
    public ResponseEntity<Presence> create(@RequestBody Presence presence) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presenceService.create(presence));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Presence> update(@PathVariable Long id, @RequestBody Presence presence) {
        return ResponseEntity.ok(presenceService.update(id, presence));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        presenceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
