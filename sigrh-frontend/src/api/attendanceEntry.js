import api from './axios'

const MOCK_DELAY = 500

const mockEmployees = [
  {
    id: 1,
    nom: 'Ngono',
    prenom: 'Carine',
    email: 'carine.ngono@sigrh.cm',
    poste: 'Responsable RH',
    departementNom: 'Ressources humaines',
    statut: 'ACTIF',
  },
  {
    id: 2,
    nom: 'Talla',
    prenom: 'Patrick',
    email: 'patrick.talla@sigrh.cm',
    poste: 'Développeur full-stack',
    departementNom: 'Informatique',
    statut: 'ACTIF',
  },
  {
    id: 3,
    nom: 'Mbarga',
    prenom: 'Ariane',
    email: 'ariane.mbarga@sigrh.cm',
    poste: 'Comptable',
    departementNom: 'Finance',
    statut: 'ACTIF',
  },
  {
    id: 4,
    nom: 'Fouda',
    prenom: 'Eric',
    email: 'eric.fouda@sigrh.cm',
    poste: 'Commercial',
    departementNom: 'Commercial',
    statut: 'ACTIF',
  },
]

let mockAttendancesByDate = {
  [today()]: [
    {
      id: 101,
      employeId: 1,
      date: today(),
      heureArrivee: '08:00',
      heureDepart: '17:00',
      statut: 'PRESENT',
    },
    {
      id: 102,
      employeId: 3,
      date: today(),
      heureArrivee: '08:35',
      heureDepart: '17:00',
      statut: 'RETARD',
    },
  ],
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeEmployee(employee) {
  return {
    id: employee.id ?? employee.employeId,
    nom: employee.nom ?? employee.lastName ?? '',
    prenom: employee.prenom ?? employee.firstName ?? '',
    email: employee.email ?? '',
    poste: employee.poste ?? employee.position ?? '',
    departementNom: employee.departementNom ?? employee.departmentName ?? employee.departement ?? '',
    photoUrl: employee.photoUrl ?? employee.avatar ?? '',
    statut: employee.statut ?? employee.status ?? 'ACTIF',
  }
}

function normalizeAttendance(attendance) {
  return {
    id: attendance.id,
    employeId: attendance.employeId ?? attendance.employeeId,
    date: attendance.date,
    heureArrivee: attendance.heureArrivee ?? attendance.arrivalTime ?? '',
    heureDepart: attendance.heureDepart ?? attendance.departureTime ?? '',
    statut: attendance.statut ?? attendance.status ?? 'PRESENT',
  }
}

export async function getActiveEmployees() {
  try {
    const response = await api.get('/employes')
    const employees = Array.isArray(response.data) ? response.data : response.data?.content ?? []
    return employees
      .map(normalizeEmployee)
      .filter((employee) => ['ACTIF', 'ACTIVE'].includes(employee.statut))
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockEmployees.map(normalizeEmployee)
  }
}

export async function getAttendancesByDate(date) {
  try {
    const response = await api.get('/presences', { params: { date } })
    const attendances = Array.isArray(response.data) ? response.data : response.data?.content ?? []
    return attendances.map(normalizeAttendance)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return (mockAttendancesByDate[date] ?? []).map(normalizeAttendance)
  }
}

export async function saveAttendance(payload) {
  try {
    const response = await api.post('/presences', payload)
    return normalizeAttendance(response.data)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    const saved = {
      id: Date.now() + Number(payload.employeId),
      ...payload,
    }
    const current = mockAttendancesByDate[payload.date] ?? []
    mockAttendancesByDate[payload.date] = [
      saved,
      ...current.filter((attendance) => Number(attendance.employeId) !== Number(payload.employeId)),
    ]
    return normalizeAttendance(saved)
  }
}

export async function saveAttendances(payloads) {
  const saved = []

  for (const payload of payloads) {
    saved.push(await saveAttendance(payload))
  }

  return saved
}
