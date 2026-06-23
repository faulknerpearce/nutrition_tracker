export type AppRoute = 'dashboard' | 'inputs' | 'recipes' | 'outputs' | 'profile'

export function parseHashRoute(hash: string): AppRoute {
  const path = hash.replace(/^#/, '').replace(/^\//, '')
  if (path === 'inputs') return 'inputs'
  if (path === 'recipes') return 'recipes'
  if (path === 'outputs') return 'outputs'
  if (path === 'profile') return 'profile'
  return 'dashboard'
}

export function routeHref(route: AppRoute): string {
  if (route === 'inputs') return '#/inputs'
  if (route === 'recipes') return '#/recipes'
  if (route === 'outputs') return '#/outputs'
  if (route === 'profile') return '#/profile'
  return '#/'
}