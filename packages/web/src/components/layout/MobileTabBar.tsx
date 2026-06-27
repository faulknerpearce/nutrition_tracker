import { primaryNavRoute, routeHref, type AppRoute } from '../../lib/routing'

interface MobileTabBarProps {
  activeRoute: AppRoute
}

export default function MobileTabBar({ activeRoute }: MobileTabBarProps) {
  const active = primaryNavRoute(activeRoute)

  return (
    <nav className="mobile-tab-bar" aria-label="Main navigation">
      <div className="mobile-tab-bar-track">
        <a
          href={routeHref('inputs')}
          className={
            active === 'inputs'
              ? 'mobile-tab-bar-side mobile-tab-bar-side-left mobile-tab-bar-side-active'
              : 'mobile-tab-bar-side mobile-tab-bar-side-left'
          }
          aria-current={active === 'inputs' ? 'page' : undefined}
        >
          Inputs
        </a>

        <a
          href={routeHref('outputs')}
          className={
            active === 'outputs'
              ? 'mobile-tab-bar-side mobile-tab-bar-side-right mobile-tab-bar-side-active'
              : 'mobile-tab-bar-side mobile-tab-bar-side-right'
          }
          aria-current={active === 'outputs' ? 'page' : undefined}
        >
          Outputs
        </a>
      </div>

      <a
        href={routeHref('dashboard')}
        className={
          active === 'dashboard'
            ? 'mobile-tab-bar-center mobile-tab-bar-center-active'
            : 'mobile-tab-bar-center'
        }
        aria-label="Dashboard"
        aria-current={active === 'dashboard' ? 'page' : undefined}
      >
        <i className="fa-solid fa-fire mobile-tab-bar-center-icon" aria-hidden="true" />
      </a>
    </nav>
  )
}