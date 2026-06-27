import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useProfileOptional } from '../context/useProfile'
import { zoneTokens } from '../lib/design-tokens'
import {
  primaryNavRoute,
  routeHref,
  routeZone,
  type AppRoute,
} from '../lib/routing'
import { fetchNewSharedCount, markSharedAsSeen } from '../lib/sharedNotifications'
import MobileTabBar from './layout/MobileTabBar'

interface LayoutProps {
  children: React.ReactNode
  activeRoute: AppRoute
}

const navTabs: { route: 'dashboard' | 'inputs' | 'outputs'; label: string }[] = [
  { route: 'dashboard', label: 'Dashboard' },
  { route: 'inputs', label: 'Inputs' },
  { route: 'outputs', label: 'Outputs' },
]

export default function Layout({ children, activeRoute }: LayoutProps) {
  const { user, signOut } = useAuth()
  const profileContext = useProfileOptional()
  const [menuOpen, setMenuOpen] = useState(false)
  const [newShareCount, setNewShareCount] = useState(0)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const activeNav = primaryNavRoute(activeRoute)
  const zone = routeZone(activeRoute)
  const layoutBg = zone === 'profile' ? zoneTokens.profile.bg : zoneTokens[activeNav === 'dashboard' ? 'dashboard' : activeNav].bg

  const displayLabel =
    profileContext?.profile.displayName ??
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email ??
    'Account'

  useEffect(() => {
    if (!user) {
      setNewShareCount(0)
      return
    }

    if (activeRoute === 'shared') {
      markSharedAsSeen()
      setNewShareCount(0)
      return
    }

    let cancelled = false
    void fetchNewSharedCount()
      .then((count) => {
        if (!cancelled) setNewShareCount(count)
      })
      .catch(() => {
        if (!cancelled) setNewShareCount(0)
      })

    return () => {
      cancelled = true
    }
  }, [user, activeRoute])

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
    <div className="app-layout" style={{ background: layoutBg }}>
      <nav className="app-nav">
        <div className="app-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <a href={routeHref('dashboard')} className="app-nav-brand" style={{ textDecoration: 'none' }}>
              <div
                className="app-nav-logo"
                style={{
                  background:
                    activeNav === 'inputs'
                      ? zoneTokens.inputs.accent
                      : activeNav === 'outputs'
                        ? zoneTokens.outputs.accent
                        : zoneTokens.dashboard.accent,
                }}
              >
                <i className="fa-solid fa-fire app-nav-logo-icon" aria-hidden="true" />
              </div>
              <span className="app-nav-title">Nutrition Tracker</span>
            </a>
            <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                aria-label={
                  newShareCount > 0
                    ? `Account menu, ${newShareCount} new shared items`
                    : 'Account menu'
                }
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => setMenuOpen((open) => !open)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: zone === 'profile' ? '1px solid #27272a' : '1px solid #e4e4e7',
                  background: zone === 'profile' ? '#27272a' : '#f4f4f5',
                  color: zone === 'profile' ? 'white' : '#3f3f46',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <i className="fa-solid fa-user" style={{ fontSize: 16 }} aria-hidden="true" />
                {newShareCount > 0 && (
                  <span className="account-menu-badge" aria-hidden="true">
                    {newShareCount > 9 ? '9+' : newShareCount}
                  </span>
                )}
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
                    borderRadius: 14,
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
                      borderRadius: 8,
                      color: '#3f3f46',
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Profile
                  </a>
                  <a
                    href={routeHref('shared')}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      color: '#3f3f46',
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Shared With Me</span>
                    {newShareCount > 0 && (
                      <span
                        style={{
                          minWidth: 18,
                          height: 18,
                          padding: '0 5px',
                          borderRadius: 9999,
                          background: '#ef4444',
                          color: 'white',
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {newShareCount > 9 ? '9+' : newShareCount}
                      </span>
                    )}
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
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#3f3f46',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="app-nav-tabs">
            {navTabs.map((tab) => {
              const active = activeNav === tab.route
              const accent = zoneTokens[tab.route].accent
              return (
                <a
                  key={tab.route}
                  href={routeHref(tab.route)}
                  className={active ? 'app-nav-tab app-nav-tab-active' : 'app-nav-tab'}
                  style={active ? ({ '--tab-accent': accent } as React.CSSProperties) : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  {tab.label}
                </a>
              )
            })}
          </div>
        </div>
      </nav>
      <main className="app-main">{children}</main>
      <MobileTabBar activeRoute={activeRoute} />
    </div>
  )
}