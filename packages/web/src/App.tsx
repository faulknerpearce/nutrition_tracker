import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { AuthProvider } from './context/AuthProvider'
import { ProfileProvider } from './context/ProfileProvider'
import { useAuth } from './context/useAuth'
import { parseHashRoute } from './lib/routing'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import InputsPage from './pages/InputsPage'
import OutputsPage from './pages/OutputsPage'
import ProfilePage from './pages/ProfilePage'
import RecipesPage from './pages/RecipesPage'

function useHashRoute() {
  const [route, setRoute] = useState(() => parseHashRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}

function AppContent() {
  const { session, loading } = useAuth()
  const route = useHashRoute()

  if (loading) {
    return (
      <div role="status" style={{ textAlign: 'center', padding: '80px 20px', color: '#a1a1aa' }}>
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
    <ProfileProvider>
      <Layout activeTab={route}>
        {route === 'profile' ? (
          <ProfilePage />
        ) : route === 'inputs' ? (
          <InputsPage />
        ) : route === 'recipes' ? (
          <RecipesPage />
        ) : route === 'outputs' ? (
          <OutputsPage />
        ) : (
          <Dashboard />
        )}
      </Layout>
    </ProfileProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
