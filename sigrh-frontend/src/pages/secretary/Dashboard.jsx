import useAuth from '../../hooks/useAuth'

export default function SecretaryDashboard() {
  const { user, logout, roleDisplayName } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-dark">Sigrh RH</h1>
            <p className="text-sm text-gray-label">Espace {roleDisplayName()}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-label">Connecté en tant que <strong>{user?.username}</strong></span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-dark mb-2">Tableau de bord Secrétaire</h2>
          <p className="text-gray-label">Gérez les présences et les documents administratifs.</p>
        </div>
      </main>
    </div>
  )
}
