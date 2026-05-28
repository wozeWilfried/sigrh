package com.sigrh.cwa.controller;

import com.sigrh.cwa.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rapports")
@RequiredArgsConstructor
public class RapportController {

    private final ExportService exportService;

    @GetMapping("/employes/excel")
    public ResponseEntity<byte[]> exportRapportEmployesExcel() {
        byte[] data = exportService.exportRapportEmployesExcel();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-rh-global.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
    }
}
