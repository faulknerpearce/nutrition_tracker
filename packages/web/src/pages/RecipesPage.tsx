import { useEffect, useState } from 'react'
import type { RecipeSummary, RecipeWithIngredients } from '@nutrition-tracker/shared'
import RecipeEditorModal from '../components/RecipeEditorModal'
import {
  deleteRecipe,
  fetchRecipe,
  fetchRecipeSummaries,
  saveRecipe,
} from '../lib/recipes'
import { cardSurface, iconTileMd, pageTitle, sectionHeader } from '../lib/styles'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredients | null | undefined>(
    undefined,
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadRecipes = async () => {
    const data = await fetchRecipeSummaries()
    setRecipes(data)
  }

  useEffect(() => {
    fetchRecipeSummaries()
      .then((data) => {
        setRecipes(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load recipes')
        setLoading(false)
      })
  }, [])

  const openCreate = () => setEditingRecipe(null)

  const openEdit = async (id: string) => {
    try {
      setEditingRecipe(await fetchRecipe(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      await deleteRecipe(id)
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe')
    } finally {
      setDeletingId(null)
    }
  }

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
        Loading recipes...
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p style={sectionHeader}>Templates</p>
          <h2 className="page-title-mobile" style={pageTitle}>
            Recipes
          </h2>
          <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
            Save meals with ingredients, then quick-log them from the food log.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          style={{
            padding: '10px 20px',
            borderRadius: 9999,
            border: 'none',
            background: '#134e4b',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          New Recipe
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {recipes.length === 0 ? (
        <div style={{ ...cardSurface, padding: 32, textAlign: 'center', color: '#71717a' }}>
          <p style={{ margin: 0 }}>No recipes yet. Create one to speed up logging.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              style={{
                ...cardSurface,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{ ...iconTileMd, background: recipe.iconBg }}>
                  <i
                    className={`fa-solid ${recipe.icon}`}
                    style={{ color: recipe.iconColor, fontSize: 18 }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#18181b' }}>{recipe.name}</div>
                  <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>
                    {recipe.ingredientCount} ingredients · {recipe.defaultServings} servings/batch ·{' '}
                    {recipe.perServingTotals.calories} kcal/serving
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => openEdit(recipe.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid #e4e4e7',
                    background: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(recipe.id)}
                  disabled={deletingId === recipe.id}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid #fecaca',
                    background: '#fff1f2',
                    color: '#b91c1c',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {deletingId === recipe.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingRecipe !== undefined && (
        <RecipeEditorModal
          recipe={editingRecipe ?? undefined}
          onClose={() => setEditingRecipe(undefined)}
          onSave={async (input) => {
            await saveRecipe(input, editingRecipe?.id)
            await loadRecipes()
          }}
        />
      )}
    </div>
  )
}