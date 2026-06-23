import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useProfileOptional } from '../context/useProfile'
import { type AppRoute, routeHref } from '../lib/routing'

interface LayoutProps {
  children: React.ReactNode
  activeTab: AppRoute
}

const tabs: { route: AppRoute; label: string }[] = [
  { route: 'dashboard', label: 'Dashboard' },
  { route: 'inputs', label: 'Inputs' },
  { route: 'recipes', label: 'Recipes' },
  { route: 'outputs', label: 'Outputs' },
]

export default function Layout({ children, activeTab }: LayoutProps) {
  const { user, signOut } = useAuth()
  const profileContext = useProfileOptional()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const displayLabel =
    profileContext?.profile.displayName ??
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email ??
    'Account'

  useEffect(() => {
    if (!menuOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e4e4e7', padding: '20px 0' }}>
        <div className="max-w-4xl mx-auto px-4">
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {tabs.map((tab) => {
                const active = activeTab === tab.route
                return (
                  <a
                    key={tab.route}
                    href={routeHref(tab.route)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                      color: active ? 'white' : '#52525b',
                      background: active ? '#134e4b' : 'transparent',
                      border: active ? '1px solid #134e4b' : '1px solid #e4e4e7',
                    }}
                  >
                    {tab.label}
                  </a>
                )
              })}
            </div>
            <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => setMenuOpen((open) => !open)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9999,
                  border:
                    activeTab === 'profile' ? '1px solid #134e4b' : '1px solid #e4e4e7',
                  background: activeTab === 'profile' ? '#134e4b' : '#f4f4f5',
                  color: activeTab === 'profile' ? 'white' : '#3f3f46',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-user" style={{ fontSize: 16 }}></i>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: 200,
                    background: 'white',
                    border: '1px solid #e4e4e7',
                    borderRadius: 16,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                    padding: 8,
                    zIndex: 50,
                  }}
                >
                  <div
                    style={{
                      padding: '10px 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#3f3f46',
                      borderBottom: '1px solid #f4f4f5',
                      marginBottom: 4,
                    }}
                  >
                    {displayLabel}
                  </div>
                  <a
                    href={routeHref('profile')}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'transparent',
                      color: '#3f3f46',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fafafa'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Profile
                  </a>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      void signOut()
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'transparent',
                      color: '#3f3f46',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fafafa'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {children}
      </main>
    </div>
  )
}