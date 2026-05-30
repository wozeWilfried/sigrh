import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../hooks/useAuth'
import Login from '../pages/Login'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminDashboard from '../pages/admin/Dashboard'
import Employes from '../pages/admin/Employes'
import EmployesAjouter from '../pages/admin/EmployesAjouter'
import EmployeeFormPage from '../pages/admin/EmployeeFormPage'
import EmployeeProfilePage from '../pages/admin/EmployeeProfilePage'
import Departements from '../pages/admin/Departements'
import Conges from '../pages/admin/Conges'
import Presences from '../pages/admin/Presences'
import AttendanceEntryPage from '../pages/admin/AttendanceEntryPage'
import AttendanceHistoryPage from '../pages/admin/AttendanceHistoryPage'
import Paie from '../pages/admin/Paie'
import PaieGenerer from '../pages/admin/PaieGenerer'
import Utilisateurs from '../pages/admin/Utilisateurs'
import Parametres from '../pages/admin/Parametres'
import RHDashboard from '../pages/rh/Dashboard'
import ManagerDashboard from '../pages/manager/Dashboard'
import ManagerEmployes from '../pages/manager/Employes'
import ManagerPresences from '../pages/manager/Presences'
import SecretaryDashboard from '../pages/secretary/Dashboard'
import TurnoverPredictions from '../pages/admin/TurnoverPredictions'
import RapportsPage from '../pages/admin/RapportsPage'
import CategoriesMateriel from '../pages/admin/CategoriesMateriel'
import MaterielDashboard from '../pages/admin/MaterielDashboard'
import AjouterMateriel from '../pages/manager/AjouterMateriel'
import ListeMateriel from '../pages/manager/ListeMateriel'
import AlertsPage from '../pages/admin/AlertsPage'
import NotFoundPage from '../pages/NotFoundPage'

export default function AppRouter() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-2 border-blue-700 border-t-transparent"
        />
      </div>
    )
  }

  const userRole = user?.role
  const isValidUser = Boolean(user && typeof userRole === 'string' && userRole.length)

  return (
    <Routes>
      <Route
        path="/"
        element={isValidUser ? <Navigate to={`/${userRole.toLowerCase()}`} replace /> : <Login />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employes"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Employes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employes/ajouter"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <EmployesAjouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employes/:id"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <EmployeeProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <EmployeeProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employes/:id/modifier"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <EmployeeFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departements"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Departements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Departements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/conges"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Conges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conges"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Conges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/presences"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Presences />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presences/saisie"
        element={
          <ProtectedRoute roles={['ADMIN', 'RH', 'SECRETAIRE', 'EMPLOYE']}>
            <AttendanceEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presences/historique"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER', 'SECRETAIRE']}>
            <AttendanceHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/paie"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Paie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/paie/generer"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <PaieGenerer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/utilisateurs"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Utilisateurs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/parametres"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Parametres />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rapports"
        element={
          <ProtectedRoute roles={['ADMIN', 'RH']}>
            <RapportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materiel"
        element={
          <ProtectedRoute roles={['ADMIN', 'RH', 'SECRETAIRE']}>
            <MaterielDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materiel/categories"
        element={
          <ProtectedRoute roles={['ADMIN', 'RH', 'SECRETAIRE']}>
            <CategoriesMateriel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materiel/liste"
        element={
          <ProtectedRoute roles={['ADMIN', 'RH', 'SECRETAIRE']}>
            <ListeMateriel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ia/predictions"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <TurnoverPredictions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alertes"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER', 'RH']}>
            <AlertsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh"
        element={
          <ProtectedRoute roles={['RH']}>
            <RHDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute roles={['MANAGER']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/employes"
        element={
          <ProtectedRoute roles={['MANAGER']}>
            <ManagerEmployes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/presences"
        element={
          <ProtectedRoute roles={['MANAGER']}>
            <ManagerPresences />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/materiel"
        element={
          <ProtectedRoute roles={['MANAGER', 'ADMIN', 'RH', 'SECRETAIRE']}>
            <MaterielDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/materiel/liste"
        element={
          <ProtectedRoute roles={['MANAGER']}>
            <ListeMateriel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/materiel/ajouter"
        element={
          <ProtectedRoute roles={['MANAGER']}>
            <AjouterMateriel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/secretaire"
        element={
          <ProtectedRoute roles={['SECRETAIRE']}>
            <AttendanceEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employe"
        element={
          <ProtectedRoute roles={['EMPLOYE']}>
            <SecretaryDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
