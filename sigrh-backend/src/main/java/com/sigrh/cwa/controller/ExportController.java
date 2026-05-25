package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    // ─── EMPLOYÉS ───────────────────────────────────

    @GetMapping("/employes/excel")
    public ResponseEntity<byte[]> exportEmployesExcel() {
        return excelResponse(exportService.exportEmployesExcel(), "employes");
    }

    @GetMapping("/employes/pdf")
    public ResponseEntity<byte[]> exportEmployesPdf() {
        return pdfResponse(exportService.exportEmployesPdf(), "employes");
    }

    // ─── CONGÉS ─────────────────────────────────────

    @GetMapping("/conges/excel")
    public ResponseEntity<byte[]> exportCongesExcel() {
        return excelResponse(exportService.exportCongesExcel(), "conges");
    }

    @GetMapping("/conges/pdf")
    public ResponseEntity<byte[]> exportCongesPdf() {
        return pdfResponse(exportService.exportCongesPdf(), "conges");
    }

    // ─── PRÉSENCES ──────────────────────────────────

    @GetMapping("/presences/excel")
    public ResponseEntity<byte[]> exportPresencesExcel() {
        return excelResponse(exportService.exportPresencesExcel(), "presences");
    }

    @GetMapping("/presences/pdf")
    public ResponseEntity<byte[]> exportPresencesPdf() {
        return pdfResponse(exportService.exportPresencesPdf(), "presences");
    }

    // ─── FICHES DE PAIE ─────────────────────────────

    @GetMapping("/paie/excel")
    public ResponseEntity<byte[]> exportPaieExcel() {
        return excelResponse(exportService.exportPaieExcel(), "paie");
    }

    @GetMapping("/paie/pdf")
    public ResponseEntity<byte[]> exportPaiePdf() {
        return pdfResponse(exportService.exportPaiePdf(), "paie");
    }

    // ─── CONTRATS ────────────────────────────────────

    @GetMapping("/contrats/excel")
    public ResponseEntity<byte[]> exportContratsExcel() {
        return excelResponse(exportService.exportContratsExcel(), "contrats");
    }

    @GetMapping("/contrats/pdf")
    public ResponseEntity<byte[]> exportContratsPdf() {
        return pdfResponse(exportService.exportContratsPdf(), "contrats");
    }

    // ─── PRIVÉ ───────────────────────────────────────

    private ResponseEntity<byte[]> excelResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(data);
    }
}
