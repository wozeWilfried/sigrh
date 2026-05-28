import api from './axios'

const MOCK_DELAY = 500

const mockEmployees = [
  { id: 1, nom: 'Ngono', prenom: 'Carine', departementNom: 'Ressources humaines', email: 'carine.ngono@sigrh.cm' },
  { id: 2, nom: 'Talla', prenom: 'Patrick', departementNom: 'Informatique', email: 'patrick.talla@sigrh.cm' },
  { id: 3, nom: 'Mbarga', prenom: 'Ariane', departementNom: 'Finance', email: 'ariane.mbarga@sigrh.cm' },
  { id: 4, nom: 'Fouda', prenom: 'Eric', departementNom: 'Commercial', email: 'eric.fouda@sigrh.cm' },
  { id: 5, nom: 'Essomba', prenom: 'Nadia', departementNom: 'Informatique', email: 'nadia.essomba@sigrh.cm' },
  { id: 6, nom: 'Kamdem', prenom: 'Samuel', departementNom: 'Operations', email: 'samuel.kamdem@sigrh.cm' },
]

function wait() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function getDateRange(startDate, endDate) {
  const dates = []
  let cursor = new Date(startDate)
  const end = new Date(endDate)

  while (cursor <= end) {
    dates.push(toIsoDate(cursor))
    cursor = addDays(cursor, 1)
  }

  return dates
}

function normalizeFilters(filters) {
  return {
    employeeId: filters.employeeId || '',
    department: filters.department || '',
    startDate: filters.startDate,
    endDate: filters.endDate,
  }
}

function getFilteredEmployees(filters) {
  const nextFilters = normalizeFilters(filters)

  return mockEmployees.filter((employee) => {
    const matchesEmployee = !nextFilters.employeeId || Number(employee.id) === Number(nextFilters.employeeId)
    const matchesDepartment = !nextFilters.department || employee.departementNom === nextFilters.department

    return matchesEmployee && matchesDepartment
  })
}

function buildMockMatrix(filters) {
  const dates = getDateRange(filters.startDate, filters.endDate)
  const employees = getFilteredEmployees(filters)
  const statusCycle = ['PRESENT', 'PRESENT', 'PRESENT', 'RETARD', 'ABSENT', null]

  return {
    employees,
    days: dates,
    records: employees.map((employee, employeeIndex) => ({
      employee,
      attendances: dates.reduce((map, date, dateIndex) => {
        const status = statusCycle[(employeeIndex + dateIndex) % statusCycle.length]
        if (!status) {
          map[date] = null
          return map
        }

        map[date] = {
          date,
          statut: status,
          heureArrivee: status === 'ABSENT' ? null : status === 'RETARD' ? '08:42' : '08:00',
          heureDepart: status === 'ABSENT' ? null : '17:00',
        }
        return map
      }, {}),
    })),
  }
}

function buildStats(history) {
  const totals = { PRESENT: 0, RETARD: 0, ABSENT: 0, EMPTY: 0 }
  const absencesByEmployee = []
  const weeklyMap = {}

  history.records.forEach((row) => {
    let absences = 0

    history.days.forEach((day) => {
      const attendance = row.attendances[day]
      const status = attendance?.statut ?? 'EMPTY'
      totals[status] = (totals[status] ?? 0) + 1
      if (status === 'ABSENT') absences += 1

      const weekKey = getWeekKey(day)
      if (!weeklyMap[weekKey]) weeklyMap[weekKey] = { week: weekKey, presents: 0, absents: 0 }
      if (status === 'PRESENT' || status === 'RETARD') weeklyMap[weekKey].presents += 1
      if (status === 'ABSENT') weeklyMap[weekKey].absents += 1
    })

    absencesByEmployee.push({
      employee: row.employee,
      absences,
    })
  })

  const totalFilled = totals.PRESENT + totals.RETARD + totals.ABSENT

  return {
    globalPresenceRate: totalFilled ? Math.round(((totals.PRESENT + totals.RETARD) / totalFilled) * 100) : 0,
    topAbsentees: absencesByEmployee
      .sort((a, b) => b.absences - a.absences)
      .slice(0, 5),
    weeklyEvolution: Object.values(weeklyMap),
    totals,
  }
}

function getWeekKey(value) {
  const date = new Date(value)
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date - firstDay) / 86400000)
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
  return `S${String(week).padStart(2, '0')}`
}

export async function getAttendanceHistory(filters) {
  try {
    const response = await api.get('/presences/historique', { params: normalizeFilters(filters) })
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return buildMockMatrix(filters)
  }
}

export async function getAttendanceStats(filters) {
  try {
    const response = await api.get('/presences/statistiques', { params: normalizeFilters(filters) })
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return buildStats(buildMockMatrix(filters))
  }
}

export async function getEmployeePresenceStats(employeId, periode = 'MENSUEL') {
  try {
    const response = await api.get('/presences/stats', {
      params: { employeId, periode },
    })
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockEmployeeStats(employeId, periode)
  }
}

function mockEmployeeStats(employeId, periode) {
  const isHebdo = periode === 'HEBDO'
  const avgHours = isHebdo ? 35.0 : 152.0
  const absences = isHebdo ? 1 : 3
  const retards = isHebdo ? 2 : 5
  const totalWorkingDays = isHebdo ? 5 : 22
  const presents = totalWorkingDays - absences - retards
  const tauxPresence = Math.round(((presents + retards) / totalWorkingDays) * 10000) / 100

  const start = isHebdo
    ? toIsoDate(new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)))
    : new Date().toISOString().slice(0, 7) + '-01'

  return {
    employeId,
    periode,
    dateDebut: start,
    dateFin: toIsoDate(new Date()),
    tauxPresence,
    nbJoursAbsents: absences,
    nbRetards: retards,
    totalHeuresTravaillees: avgHours,
    moyenneHeuresJour: Math.round((avgHours / presents) * 100) / 100,
  }
}

export async function getAttendanceEmployees() {
  try {
    const response = await api.get('/employes')
    const employees = Array.isArray(response.data) ? response.data : response.data?.content ?? []
    return employees.map((employee) => ({
      id: employee.id ?? employee.employeId,
      nom: employee.nom ?? employee.lastName ?? '',
      prenom: employee.prenom ?? employee.firstName ?? '',
      departementNom: employee.departementNom ?? employee.departmentName ?? employee.departement ?? '',
      email: employee.email ?? '',
    }))
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockEmployees
  }
}
