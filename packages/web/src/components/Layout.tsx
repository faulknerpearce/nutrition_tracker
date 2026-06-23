import { useAuth } from '../context/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const displayLabel =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email ?? 'Account'

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e4e4e7', padding: '20px 0' }}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: '#134e4b',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fa-solid fa-chart-line" style={{ color: 'white', fontSize: 18 }}></i>
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '-0.02em',
              }}
            >
              Nutrition Tracker
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#71717a' }}>{displayLabel}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                background: 'white',
                color: '#3f3f46',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {children}
      </main>
    </div>
  )
}