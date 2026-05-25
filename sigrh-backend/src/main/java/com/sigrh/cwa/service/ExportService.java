package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.springframework.stereotype.Service;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.UnitValue;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final EmployeRepository employeRepo;
    private final PresenceRepository presenceRepo;
    private final CongeRepository congeRepo;
    private final FichePaieRepository paieRepo;
    private final ContratRepository contratRepo;

    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ─── EMPLOYÉS ───────────────────────────────────

    public byte[] exportEmployesExcel() {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet sheet = wb.createSheet("Employés");
            writeHeader(wb, sheet, "Matricule", "Nom", "Prénom", "Email", "Poste", "Département", "Salaire", "Statut");
            List<Employe> emps = employeRepo.findAll();
            for (int i = 0; i < emps.size(); i++) {
                Employe e = emps.get(i);
                XSSFRow row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(e.getMatricule());
                row.createCell(1).setCellValue(e.getNom());
                row.createCell(2).setCellValue(e.getPrenom());
                row.createCell(3).setCellValue(e.getEmail());
                row.createCell(4).setCellValue(e.getPoste());
                row.createCell(5).setCellValue(e.getDepartement() != null ? e.getDepartement().getNom() : "");
                row.createCell(6).setCellValue(e.getSalaire() != null ? e.getSalaire() : 0);
                row.createCell(7).setCellValue(e.getStatut() != null ? e.getStatut().name() : "");
            }
            for (int i = 0; i < 8; i++) sheet.autoSizeColumn(i);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export Excel employés", e);
        }
    }

    public byte[] exportEmployesPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.add(new Paragraph("Liste des employés").setBold().setFontSize(16));
            Table table = new Table(UnitValue.createPercentArray(new float[]{2,2,2,3,3,3,2,2}));
            String[] headers = {"Matricule","Nom","Prénom","Email","Poste","Département","Salaire","Statut"};
            for (String h : headers) table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            employeRepo.findAll().forEach(e -> {
                table.addCell(e.getMatricule()); table.addCell(e.getNom()); table.addCell(e.getPrenom());
                table.addCell(e.getEmail()); table.addCell(e.getPoste());
                table.addCell(e.getDepartement() != null ? e.getDepartement().getNom() : "");
                table.addCell(e.getSalaire() != null ? String.valueOf(e.getSalaire()) : "");
                table.addCell(e.getStatut() != null ? e.getStatut().name() : "");
            });
            doc.add(table); doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export PDF employés", e);
        }
    }

    // ─── CONGÉS ─────────────────────────────────────

    public byte[] exportCongesExcel() {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet sheet = wb.createSheet("Congés");
            writeHeader(wb, sheet, "Employé", "Type", "Date début", "Date fin", "Statut");
            List<Conge> conges = congeRepo.findAll();
            for (int i = 0; i < conges.size(); i++) {
                Conge c = conges.get(i);
                XSSFRow row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(c.getEmploye().getNom() + " " + c.getEmploye().getPrenom());
                row.createCell(1).setCellValue(c.getType().name());
                row.createCell(2).setCellValue(c.getDateDebut() != null ? c.getDateDebut().format(DTF) : "");
                row.createCell(3).setCellValue(c.getDateFin() != null ? c.getDateFin().format(DTF) : "");
                row.createCell(4).setCellValue(c.getStatut().name());
            }
            for (int i = 0; i < 5; i++) sheet.autoSizeColumn(i);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export Excel congés", e);
        }
    }

    public byte[] exportCongesPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.add(new Paragraph("Liste des congés").setBold().setFontSize(16));
            Table table = new Table(UnitValue.createPercentArray(new float[]{3,2,2,2,2}));
            String[] headers = {"Employé","Type","Date début","Date fin","Statut"};
            for (String h : headers) table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            congeRepo.findAll().forEach(c -> {
                table.addCell(c.getEmploye().getNom() + " " + c.getEmploye().getPrenom());
                table.addCell(c.getType().name());
                table.addCell(c.getDateDebut() != null ? c.getDateDebut().format(DTF) : "");
                table.addCell(c.getDateFin() != null ? c.getDateFin().format(DTF) : "");
                table.addCell(c.getStatut().name());
            });
            doc.add(table); doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export PDF congés", e);
        }
    }

    // ─── PRÉSENCES ──────────────────────────────────

    public byte[] exportPresencesExcel() {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet sheet = wb.createSheet("Présences");
            writeHeader(wb, sheet, "Employé", "Date", "Statut");
            List<Presence> list = presenceRepo.findAll();
            for (int i = 0; i < list.size(); i++) {
                Presence p = list.get(i);
                XSSFRow row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(p.getEmploye().getNom() + " " + p.getEmploye().getPrenom());
                row.createCell(1).setCellValue(p.getDate().format(DTF));
                row.createCell(2).setCellValue(p.getStatut().name());
            }
            for (int i = 0; i < 3; i++) sheet.autoSizeColumn(i);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export Excel présences", e);
        }
    }

    public byte[] exportPresencesPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.add(new Paragraph("Registre des présences").setBold().setFontSize(16));
            Table table = new Table(UnitValue.createPercentArray(new float[]{3,2,2}));
            String[] headers = {"Employé","Date","Statut"};
            for (String h : headers) table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            presenceRepo.findAll().forEach(p -> {
                table.addCell(p.getEmploye().getNom() + " " + p.getEmploye().getPrenom());
                table.addCell(p.getDate().format(DTF));
                table.addCell(p.getStatut().name());
            });
            doc.add(table); doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export PDF présences", e);
        }
    }

    // ─── FICHES DE PAIE ─────────────────────────────

    public byte[] exportPaieExcel() {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet sheet = wb.createSheet("Fiches de paie");
            writeHeader(wb, sheet, "Employé", "Période", "Salaire brut", "Salaire net", "Validée");
            List<FichePaie> list = paieRepo.findAll();
            for (int i = 0; i < list.size(); i++) {
                FichePaie f = list.get(i);
                XSSFRow row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(f.getEmploye().getNom() + " " + f.getEmploye().getPrenom());
                row.createCell(1).setCellValue(f.getMois() + "/" + f.getAnnee());
                row.createCell(2).setCellValue(f.getSalaireBrut());
                row.createCell(3).setCellValue(f.getSalaireNet());
                row.createCell(4).setCellValue(f.isValide() ? "Oui" : "Non");
            }
            for (int i = 0; i < 5; i++) sheet.autoSizeColumn(i);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export Excel paie", e);
        }
    }

    public byte[] exportPaiePdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.add(new Paragraph("Fiches de paie").setBold().setFontSize(16));
            Table table = new Table(UnitValue.createPercentArray(new float[]{3,2,2,2,1}));
            String[] headers = {"Employé","Période","Brut","Net","Validée"};
            for (String h : headers) table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            paieRepo.findAll().forEach(f -> {
                table.addCell(f.getEmploye().getNom() + " " + f.getEmploye().getPrenom());
                table.addCell(f.getMois() + "/" + f.getAnnee());
                table.addCell(String.valueOf(f.getSalaireBrut()));
                table.addCell(String.valueOf(f.getSalaireNet()));
                table.addCell(f.isValide() ? "Oui" : "Non");
            });
            doc.add(table); doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export PDF paie", e);
        }
    }

    // ─── CONTRATS ────────────────────────────────────

    public byte[] exportContratsExcel() {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet sheet = wb.createSheet("Contrats");
            writeHeader(wb, sheet, "Référence", "Employé", "Type", "Date début", "Date fin", "Salaire", "Statut");
            List<Contrat> list = contratRepo.findAll();
            for (int i = 0; i < list.size(); i++) {
                Contrat c = list.get(i);
                XSSFRow row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(c.getReference());
                row.createCell(1).setCellValue(c.getEmploye().getNom() + " " + c.getEmploye().getPrenom());
                row.createCell(2).setCellValue(c.getType().name());
                row.createCell(3).setCellValue(c.getDateDebut() != null ? c.getDateDebut().format(DTF) : "");
                row.createCell(4).setCellValue(c.getDateFin() != null ? c.getDateFin().format(DTF) : "");
                row.createCell(5).setCellValue(c.getSalaire() != null ? c.getSalaire() : 0);
                row.createCell(6).setCellValue(c.getStatut().name());
            }
            for (int i = 0; i < 7; i++) sheet.autoSizeColumn(i);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export Excel contrats", e);
        }
    }

    public byte[] exportContratsPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.add(new Paragraph("Liste des contrats").setBold().setFontSize(16));
            Table table = new Table(UnitValue.createPercentArray(new float[]{2,2,2,2,2,3,2}));
            String[] headers = {"Référence","Employé","Type","Début","Fin","Salaire","Statut"};
            for (String h : headers) table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            contratRepo.findAll().forEach(c -> {
                table.addCell(c.getReference());
                table.addCell(c.getEmploye().getNom() + " " + c.getEmploye().getPrenom());
                table.addCell(c.getType().name());
                table.addCell(c.getDateDebut() != null ? c.getDateDebut().format(DTF) : "");
                table.addCell(c.getDateFin() != null ? c.getDateFin().format(DTF) : "");
                table.addCell(c.getSalaire() != null ? String.valueOf(c.getSalaire()) : "");
                table.addCell(c.getStatut().name());
            });
            doc.add(table); doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'export PDF contrats", e);
        }
    }

    // ─── PRIVÉ ───────────────────────────────────────

    private void writeHeader(XSSFWorkbook wb, XSSFSheet sheet, String... columns) {
        XSSFRow header = sheet.createRow(0);
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        for (int i = 0; i < columns.length; i++) {
            var cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(style);
        }
    }
}
