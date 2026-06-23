import Layout from './components/Layout'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function AppContent() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div
        role="status"
        style={{ textAlign: 'center', padding: '80px 20px', color: '#a1a1aa' }}
      >
        <i
          className="fa-solid fa-spinner fa-spin"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        Loading…
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}