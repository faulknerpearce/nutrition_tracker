import { useCallback, useRef } from 'react'
import type { AppRoute } from '../lib/routing'
import PageHeader from '../components/layout/PageHeader'
import PageShell from '../components/layout/PageShell'
import ZoneButton from '../components/layout/ZoneButton'
import ZoneSubNav from '../components/layout/ZoneSubNav'
import OutputsPage from './OutputsPage'
import WorkoutsPage from './WorkoutsPage'

interface OutputsZoneProps {
  route: Extract<AppRoute, 'outputs' | 'outputs/workouts'>
}

export default function OutputsZone({ route }: OutputsZoneProps) {
  const isWorkouts = route === 'outputs/workouts'
  const openCreateWorkoutRef = useRef<(() => void) | null>(null)
  const handleOpenCreateReady = useCallback((openCreate: () => void) => {
    openCreateWorkoutRef.current = openCreate
  }, [])

  return (
    <PageShell zone="outputs">
      <PageHeader
        eyebrow={isWorkouts ? 'Outputs › Workouts' : 'Outputs'}
        title={isWorkouts ? 'Workouts' : 'Activity Log'}
        description={
          isWorkouts
            ? 'Saved routines for quick activity logging.'
            : 'Browse days and log activities with stats and history.'
        }
        actions={
          isWorkouts ? (
            <ZoneButton variant="primary" onClick={() => openCreateWorkoutRef.current?.()}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> New Workout
            </ZoneButton>
          ) : undefined
        }
      />
      <ZoneSubNav
        active={route}
        items={[
          { route: 'outputs', label: 'Log' },
          { route: 'outputs/workouts', label: 'Workouts' },
        ]}
      />
      {isWorkouts ? (
        <WorkoutsPage onOpenCreateReady={handleOpenCreateReady} />
      ) : (
        <OutputsPage />
      )}
    </PageShell>
  )
}