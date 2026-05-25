import { Routes, Route, Navigate } from 'react-router-dom'
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
import Rapports from '../pages/admin/Rapports'
import Utilisateurs from '../pages/admin/Utilisateurs'
import Parametres from '../pages/admin/Parametres'
import RHDashboard from '../pages/rh/Dashboard'
import ManagerDashboard from '../pages/manager/Dashboard'
import SecretaryDashboard from '../pages/secretary/Dashboard'

export default function AppRouter() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-deep border-t-transparent" />
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
          <ProtectedRoute roles={['ADMIN', 'RH', 'EMPLOYE']}>
            <AttendanceEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presences/historique"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
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
        path="/admin/rapports"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Rapports />
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
        path="/employe"
        element={
          <ProtectedRoute roles={['EMPLOYE']}>
            <SecretaryDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
