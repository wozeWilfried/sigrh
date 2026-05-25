package com.sigrh.cwa.service;

import com.sigrh.cwa.entity.*;
import com.sigrh.cwa.repository.*;
import com.sigrh.cwa.enums.StatutPresence;
import com.sigrh.cwa.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion des présences des employés.
 * Permet de:
 * - Enregistrer les présences/absences des employés
 * - Générer des rapports mensuels de présence
 * - Filtrer l'accès selon le rôle de l'utilisateur (Admin, RH, Manager, Employé)
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

    private final PresenceRepository presenceRepo;
    private final EmployeRepository employeRepo;
    private final SecurityHelper security;

    /**
     * Récupère toutes les présences (optionnellement filtrées par date).
     * L'accès est restreint selon le rôle de l'utilisateur.
     * 
     * @param date Date de présence à filtrer (optionnelle)
     * @return Liste des présences au format Map
     */
    public List<Map<String, Object>> findAll(LocalDate date) {
        List<Presence> list = date != null
            ? presenceRepo.findByDate(date)
            : presenceRepo.findAll();
        if (security.isAdminOrRh()) {
            return list.stream().map(this::toMap).collect(Collectors.toList());
        }
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return list.stream()
                .filter(p -> p.getEmploye() != null && p.getEmploye().getDepartement() != null
                    && p.getEmploye().getDepartement().getId().equals(deptId))
                .map(this::toMap).collect(Collectors.toList());
        }
        // Employé : accès limité à ses propres présences
        return list.stream()
            .filter(p -> p.getEmploye() != null && p.getEmploye().getId().equals(security.getCurrentEmployeId()))
            .map(this::toMap).collect(Collectors.toList());
    }

    /**
     * Récupère les présences d'un employé sur une période donnée.
     * 
     * @param employeId Identifiant de l'employé
     * @param debut Date de début de la période
     * @param fin Date de fin de la période
     * @return Liste des présences de la période
     */
    public List<Map<String, Object>> findByEmploye(Long employeId, LocalDate debut, LocalDate fin) {
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        return presenceRepo.findByEmployeIdAndDateBetween(employeId, debut, fin)
            .stream().map(this::toMap).collect(Collectors.toList());
    }

    public Map<String, Object> getAttendanceHistory(Long employeeId, String department, LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(13);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        if (employeeId != null && !security.canAccessEmploye(employeeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");

        // Build efficient cache of filtered presences
        List<Presence> allPresences = presenceRepo.findAll();
        Map<Long, List<Presence>> presencesByEmployeeId = new LinkedHashMap<>();
        Set<Long> visibleEmployeeIds = new HashSet<>();
        
        for (Presence p : allPresences) {
            if (p.getDate() == null || p.getEmploye() == null) continue;
            if (p.getDate().isBefore(start) || p.getDate().isAfter(end)) continue;
            
            Long empId = p.getEmploye().getId();
            if (employeeId != null && !employeeId.equals(empId)) continue;
            if (department != null && !department.isBlank() && 
                (p.getEmploye().getDepartement() == null || !department.equalsIgnoreCase(p.getEmploye().getDepartement().getNom()))) 
                continue;
            
            if (visibleByRole(p)) {
                presencesByEmployeeId.computeIfAbsent(empId, key -> new ArrayList<>()).add(p);
                visibleEmployeeIds.add(empId);
            }
        }

        // Build days list
        List<String> days = start.datesUntil(end.plusDays(1))
            .map(LocalDate::toString)
            .toList();

        // Build employee maps from visible employees
        Map<Long, Map<String, Object>> employeeMap = new LinkedHashMap<>();
        for (Long empId : visibleEmployeeIds) {
            Optional<Employe> employe = employeRepo.findById(empId);
            if (employe.isPresent()) {
                Employe e = employe.get();
                Map<String, Object> eMap = new LinkedHashMap<>();
                eMap.put("id", e.getId());
                eMap.put("nom", e.getNom());
                eMap.put("prenom", e.getPrenom());
                eMap.put("departementNom", e.getDepartement() != null ? e.getDepartement().getNom() : null);
                eMap.put("email", e.getEmail());
                employeeMap.put(empId, eMap);
            }
        }

        // Build records: employee -> day -> attendance
        List<Map<String, Object>> records = new ArrayList<>();
        for (Map.Entry<Long, Map<String, Object>> emp : employeeMap.entrySet()) {
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("employee", emp.getValue());
            
            Map<String, Object> attendanceByDay = new LinkedHashMap<>();
            List<Presence> empPresences = presencesByEmployeeId.getOrDefault(emp.getKey(), new ArrayList<>());
            
            for (String day : days) {
                LocalDate dayDate = LocalDate.parse(day);
                Presence p = empPresences.stream()
                    .filter(presence -> dayDate.equals(presence.getDate()))
                    .findFirst()
                    .orElse(null);
                attendanceByDay.put(day, p != null ? toMap(p) : null);
            }
            
            record.put("attendances", attendanceByDay);
            records.add(record);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("employees", new ArrayList<>(employeeMap.values()));
        response.put("days", days);
        response.put("records", records);
        return response;
    }

    public Map<String, Object> getAttendanceStatistics(Long employeeId, String department, LocalDate startDate, LocalDate endDate) {
        @SuppressWarnings("unchecked")
        Map<String, Object> history = getAttendanceHistory(employeeId, department, startDate, endDate);
        @SuppressWarnings("unchecked")
        List<String> days = (List<String>) history.get("days");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> records = (List<Map<String, Object>>) history.get("records");

        Map<String, Long> totals = initializeTotals();
        Map<String, Map<String, Long>> weeklyMap = new LinkedHashMap<>();
        List<Map<String, Object>> absencesByEmployee = new ArrayList<>();

        for (Map<String, Object> row : records) {
            long absences = processRowForStats(row, days, totals, weeklyMap);
            addAbsenceEntry(row, absences, absencesByEmployee);
        }

        return buildStatsResponse(totals, absencesByEmployee, weeklyMap);
    }

    private Map<String, Long> initializeTotals() {
        Map<String, Long> totals = new LinkedHashMap<>();
        totals.put("PRESENT", 0L);
        totals.put("RETARD", 0L);
        totals.put("ABSENT", 0L);
        totals.put("EMPTY", 0L);
        return totals;
    }

    @SuppressWarnings("unchecked")
    private long processRowForStats(Map<String, Object> row, List<String> days, 
                                     Map<String, Long> totals, Map<String, Map<String, Long>> weeklyMap) {
        long absences = 0;
        Map<String, Object> attendances = (Map<String, Object>) row.get("attendances");

        for (String day : days) {
            Map<String, Object> attendance = (Map<String, Object>) attendances.get(day);
            String statut = attendance == null ? "EMPTY" : attendance.get("statut").toString();
            updateTotals(totals, statut);
            if ("ABSENT".equals(statut)) absences++;
            updateWeeklyStats(weeklyMap, day, statut);
        }
        return absences;
    }

    private void updateTotals(Map<String, Long> totals, String statut) {
        totals.put(statut, totals.get(statut) + 1);
    }

    private void updateWeeklyStats(Map<String, Map<String, Long>> weeklyMap, String day, String statut) {
        String weekKey = getWeekKey(day);
        weeklyMap.computeIfAbsent(weekKey, key -> createWeekData());
        Map<String, Long> weekData = weeklyMap.get(weekKey);
        
        if ("PRESENT".equals(statut) || "RETARD".equals(statut)) {
            weekData.put("presents", weekData.get("presents") + 1);
        }
        if ("ABSENT".equals(statut)) {
            weekData.put("absents", weekData.get("absents") + 1);
        }
    }

    private Map<String, Long> createWeekData() {
        Map<String, Long> data = new LinkedHashMap<>();
        data.put("week", null);
        data.put("presents", 0L);
        data.put("absents", 0L);
        return data;
    }

    @SuppressWarnings("unchecked")
    private void addAbsenceEntry(Map<String, Object> row, long absences, 
                                  List<Map<String, Object>> absencesByEmployee) {
        Map<String, Object> employee = (Map<String, Object>) row.get("employee");
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("employee", employee);
        entry.put("absences", absences);
        absencesByEmployee.add(entry);
    }

    private Map<String, Object> buildStatsResponse(Map<String, Long> totals,
                                                    List<Map<String, Object>> absencesByEmployee,
                                                    Map<String, Map<String, Long>> weeklyMap) {
        long presentCount = totals.get("PRESENT");
        long retardCount = totals.get("RETARD");
        long absentCount = totals.get("ABSENT");
        long filledCount = presentCount + retardCount + absentCount;
        long globalPresenceRate = filledCount == 0 ? 0 : Math.round(((presentCount + retardCount) * 100.0) / filledCount);

        List<Map<String, Object>> topAbsentees = absencesByEmployee.stream()
            .sorted((a, b) -> Long.compare((Long) b.get("absences"), (Long) a.get("absences")))
            .limit(5)
            .toList();

        List<Map<String, Object>> weeklyEvolution = weeklyMap.entrySet().stream()
            .map(entry -> {
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("week", entry.getKey());
                data.put("presents", entry.getValue().get("presents"));
                data.put("absents", entry.getValue().get("absents"));
                return data;
            })
            .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("globalPresenceRate", globalPresenceRate);
        response.put("topAbsentees", topAbsentees);
        response.put("weeklyEvolution", weeklyEvolution);
        response.put("totals", totals);
        return response;
    }

    private boolean filterByDepartment(Presence p, String department) {
        return department == null || department.isBlank() 
            || (p.getEmploye().getDepartement() != null && department.equalsIgnoreCase(p.getEmploye().getDepartement().getNom()));
    }

    private boolean visibleByRole(Presence p) {
        if (security.isAdminOrRh()) return true;
        if (security.isManager()) {
            Long deptId = security.getCurrentDepartementId();
            return p.getEmploye().getDepartement() != null && p.getEmploye().getDepartement().getId().equals(deptId);
        }
        return p.getEmploye().getId().equals(security.getCurrentEmployeId());
    }

    private String getWeekKey(String value) {
        java.time.LocalDate date = java.time.LocalDate.parse(value);
        java.time.LocalDate firstDay = java.time.LocalDate.of(date.getYear(), 1, 1);
        long days = java.time.Duration.between(firstDay.atStartOfDay(), date.atStartOfDay()).toDays();
        long week = (days + firstDay.getDayOfWeek().getValue()) / 7 + 1;
        return String.format("S%02d", week);
    }

    /**
     * Enregistre un pointage de présence/absence pour un employé.
     * 
     * @param data Données contenant: employeId, date, statut, heureArrivee, heureDepart
     * @return Données de la présence enregistrée
     */
    @Transactional
    public Map<String, Object> pointer(Map<String, Object> data) {
        Long employeId = Long.valueOf(data.get("employeId").toString());
        Employe employe = employeRepo.findById(employeId).orElseThrow();
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");

        Presence p = Presence.builder()
            .employe(employe)
            .date(LocalDate.parse(data.get("date").toString()))
            .statut(StatutPresence.valueOf(data.get("statut").toString()))
            .build();

        if (data.get("heureArrivee") != null)
            p.setHeureArrivee(java.time.LocalTime.parse(data.get("heureArrivee").toString()));
        if (data.get("heureDepart") != null)
            p.setHeureDepart(java.time.LocalTime.parse(data.get("heureDepart").toString()));

        return toMap(presenceRepo.save(p));
    }

    /**
     * Génère un rapport mensuel de présence/absence pour un employé.
     * Inclut le résumé et les détails des présences du mois.
     * 
     * @param employeId Identifiant de l'employé
     * @param mois Mois à analyser (1-12)
     * @param annee Année à analyser
     * @return Rapport contenant présents, absents, retards et congés
     */
    public Map<String, Object> getRapportMensuel(Long employeId, int mois, int annee) {
        if (!security.canAccessEmploye(employeId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        LocalDate debut = LocalDate.of(annee, mois, 1);
        LocalDate fin   = debut.withDayOfMonth(debut.lengthOfMonth());
        List<Presence> list = presenceRepo.findByEmployeIdAndDateBetween(employeId, debut, fin);

        Map<String, Object> rapport = new HashMap<>();
        rapport.put("employeId", employeId);
        rapport.put("totalJours", list.size());
        rapport.put("presents",   list.stream().filter(p -> p.getStatut() == StatutPresence.PRESENT).count());
        rapport.put("absents",    list.stream().filter(p -> p.getStatut() == StatutPresence.ABSENT).count());
        rapport.put("retards",    list.stream().filter(p -> p.getStatut() == StatutPresence.RETARD).count());
        rapport.put("conges",     list.stream().filter(p -> p.getStatut() == StatutPresence.CONGE).count());
        rapport.put("details",    list.stream().map(this::toMap).collect(Collectors.toList()));
        return rapport;
    }

    /**
     * Convertit une entité Presence en Map pour la sérialisation JSON.
     * 
     * @param p Entité Presence à convertir
     * @return Map contenant les données de la présence
     */
    private Map<String, Object> toMap(Presence p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("employeId", p.getEmploye().getId());
        m.put("employeNom", p.getEmploye().getNom() + " " + p.getEmploye().getPrenom());
        m.put("date", p.getDate());
        m.put("heureArrivee", p.getHeureArrivee());
        m.put("heureDepart", p.getHeureDepart());
        m.put("statut", p.getStatut().name());
        return m;
    }
}
