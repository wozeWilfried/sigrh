import AppRouter from './routes/AppRouter'
import ToastProvider from './components/ui/ToastProvider'
import ConfirmProvider from './components/ui/ConfirmProvider'

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AppRouter />
      </ConfirmProvider>
    </ToastProvider>
  )
}
