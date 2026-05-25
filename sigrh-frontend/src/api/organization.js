import api from './axios'

const MOCK_DELAY = 500

let mockDepartments = [
  {
    id: 1,
    nom: 'Ressources humaines',
    description: 'Administration du personnel, contrats, paie et conformité RH.',
    responsable: 'Carine Ngono',
    employeeCount: 8,
  },
  {
    id: 2,
    nom: 'Informatique',
    description: 'Support applicatif, infrastructure et sécurité numérique.',
    responsable: 'Patrick Mbarga',
    employeeCount: 14,
  },
  {
    id: 3,
    nom: 'Finance',
    description: 'Comptabilité, trésorerie, reporting et contrôle budgétaire.',
    responsable: 'Ariane Talla',
    employeeCount: 6,
  },
]

let mockPositions = [
  { id: 1, name: 'Responsable RH', departmentId: 1 },
  { id: 2, name: 'Assistant RH', departmentId: 1 },
  { id: 3, name: 'Développeur full-stack', departmentId: 2 },
  { id: 4, name: 'Administrateur systèmes', departmentId: 2 },
  { id: 5, name: 'Comptable', departmentId: 3 },
]

function wait() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

function normalizeDepartment(department) {
  const employees = department.employes ?? department.employees ?? []

  return {
    id: department.id,
    name: department.nom ?? department.name ?? '',
    description: department.description ?? '',
    manager: department.responsable ?? department.manager ?? '',
    employeeCount: department.employeeCount ?? department.nombreEmployes ?? employees.length ?? 0,
  }
}

function toDepartmentPayload(department) {
  return {
    nom: department.name,
    description: department.description,
    responsable: department.manager,
  }
}

function normalizePosition(position) {
  return {
    id: position.id,
    name: position.name ?? position.nom ?? position.poste ?? '',
    departmentId: Number(position.departmentId ?? position.departementId),
  }
}

export async function getDepartments() {
  try {
    const response = await api.get('/departements')
    return response.data.map(normalizeDepartment)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockDepartments.map(normalizeDepartment)
  }
}

export async function createDepartment(department) {
  try {
    const response = await api.post('/departements', toDepartmentPayload(department))
    return normalizeDepartment(response.data)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    const created = {
      id: Date.now(),
      nom: department.name,
      description: department.description,
      responsable: department.manager,
      employeeCount: 0,
    }
    mockDepartments = [created, ...mockDepartments]
    return normalizeDepartment(created)
  }
}

export async function updateDepartment(id, department) {
  try {
    const response = await api.put(`/departements/${id}`, toDepartmentPayload(department))
    return normalizeDepartment(response.data)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    mockDepartments = mockDepartments.map((item) =>
      Number(item.id) === Number(id)
        ? {
            ...item,
            nom: department.name,
            description: department.description,
            responsable: department.manager,
          }
        : item
    )
    return normalizeDepartment(mockDepartments.find((item) => Number(item.id) === Number(id)))
  }
}

export async function deleteDepartment(id) {
  try {
    await api.delete(`/departements/${id}`)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
  }

  mockDepartments = mockDepartments.filter((department) => Number(department.id) !== Number(id))
  mockPositions = mockPositions.filter((position) => Number(position.departmentId) !== Number(id))
}

export async function getPositions() {
  await wait()
  return mockPositions.map(normalizePosition)
}

export async function createPosition(position) {
  await wait()
  const created = {
    id: Date.now(),
    name: position.name,
    departmentId: Number(position.departmentId),
  }
  mockPositions = [created, ...mockPositions]
  return normalizePosition(created)
}

export async function updatePosition(id, position) {
  await wait()
  mockPositions = mockPositions.map((item) =>
    Number(item.id) === Number(id)
      ? { ...item, name: position.name, departmentId: Number(position.departmentId) }
      : item
  )
  return normalizePosition(mockPositions.find((item) => Number(item.id) === Number(id)))
}

export async function deletePosition(id) {
  await wait()
  mockPositions = mockPositions.filter((position) => Number(position.id) !== Number(id))
}
