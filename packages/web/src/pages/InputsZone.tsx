import { useCallback, useRef } from 'react'
import type { AppRoute } from '../lib/routing'
import PageHeader from '../components/layout/PageHeader'
import PageShell from '../components/layout/PageShell'
import ZoneButton from '../components/layout/ZoneButton'
import ZoneSubNav from '../components/layout/ZoneSubNav'
import InputsPage from './InputsPage'
import RecipesPage from './RecipesPage'

interface InputsZoneProps {
  route: Extract<AppRoute, 'inputs' | 'inputs/recipes'>
}

export default function InputsZone({ route }: InputsZoneProps) {
  const isRecipes = route === 'inputs/recipes'
  const openCreateRecipeRef = useRef<(() => void) | null>(null)
  const openAddEntryRef = useRef<(() => void) | null>(null)
  const openBarcodeScannerRef = useRef<(() => void) | null>(null)
  const handleOpenCreateReady = useCallback((openCreate: () => void) => {
    openCreateRecipeRef.current = openCreate
  }, [])
  const handleOpenAddEntryReady = useCallback((openAddEntry: () => void) => {
    openAddEntryRef.current = openAddEntry
  }, [])
  const handleOpenBarcodeScannerReady = useCallback((openBarcodeScanner: () => void) => {
    openBarcodeScannerRef.current = openBarcodeScanner
  }, [])

  return (
    <PageShell zone="inputs">
      <PageHeader
        eyebrow={isRecipes ? 'Inputs › Recipes' : 'Inputs'}
        title={isRecipes ? 'Recipes' : 'Food Log'}
        description={
          isRecipes
            ? 'Saved meal templates for quick logging.'
            : 'Browse days and log food entries with stats and history.'
        }
        actions={
          isRecipes ? (
            <ZoneButton variant="primary" onClick={() => openCreateRecipeRef.current?.()}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> New Recipe
            </ZoneButton>
          ) : (
            <>
              <ZoneButton variant="secondary" onClick={() => openBarcodeScannerRef.current?.()}>
                <i className="fa-solid fa-barcode" aria-hidden="true" /> Scan Barcode
              </ZoneButton>
              <ZoneButton variant="primary" onClick={() => openAddEntryRef.current?.()}>
                <i className="fa-solid fa-plus" aria-hidden="true" /> Add Entry
              </ZoneButton>
            </>
          )
        }
      />
      <ZoneSubNav
        active={route}
        items={[
          { route: 'inputs', label: 'Log' },
          { route: 'inputs/recipes', label: 'Recipes' },
        ]}
      />
      {isRecipes ? (
        <RecipesPage onOpenCreateReady={handleOpenCreateReady} />
      ) : (
        <InputsPage
          onOpenAddEntryReady={handleOpenAddEntryReady}
          onOpenBarcodeScannerReady={handleOpenBarcodeScannerReady}
        />
      )}
    </PageShell>
  )
}