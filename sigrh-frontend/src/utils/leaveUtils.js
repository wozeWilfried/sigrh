/**
 * Calcule le nombre de jours ouvrés entre deux dates (week-ends exclus).
 * @param {string} startDate - "YYYY-MM-DD"
 * @param {string} endDate   - "YYYY-MM-DD"
 * @returns {number}
 */
export function countWorkingDays(startDate, endDate) {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (end < start) return 0

  let count = 0
  const cursor = new Date(start)

  while (cursor <= end) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) count++
    cursor.setDate(cursor.getDate() + 1)
  }

  return count
}

/**
 * Formate une date ISO en format français lisible.
 * @param {string} value - "YYYY-MM-DD"
 * @returns {string}
 */
export function formatDateFr(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

/**
 * Retourne les initiales d'un nom complet (max 2 lettres).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

/**
 * Génère une couleur d'avatar deterministe à partir du nom.
 * @param {string} name
 * @returns {string} classe Tailwind CSS
 */
export function getAvatarColor(name = '') {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index] ?? colors[0]
}
