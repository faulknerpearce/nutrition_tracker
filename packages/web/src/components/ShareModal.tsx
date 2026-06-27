import { useEffect, useRef, useState } from 'react'
import type { ShareUserResult } from '@nutrition-tracker/shared'
import {
  fetchActivitySharesForResource,
  fetchEntrySharesForResource,
  fetchRecipeSharesForResource,
  fetchWorkoutSharesForResource,
  findUsersForShare,
  revokeActivityShare,
  revokeEntryShare,
  revokeRecipeShare,
  revokeWorkoutShare,
  shareActivity,
  shareEntry,
  shareRecipe,
  shareWorkout,
} from '../lib/sharing'
import { focusIfDesktop } from '../lib/device'
import { inputBase, labelBase, primaryButton } from '../lib/styles'
import Modal from './Modal'

type ShareResourceType = 'recipe' | 'workout' | 'entry' | 'activity'

const SHARE_TITLES: Record<ShareResourceType, string> = {
  recipe: 'Share Recipe',
  workout: 'Share Workout',
  entry: 'Share Entry',
  activity: 'Share Activity',
}

async function fetchSharesForResource(resourceType: ShareResourceType, resourceId: string) {
  switch (resourceType) {
    case 'recipe':
      return fetchRecipeSharesForResource(resourceId)
    case 'workout':
      return fetchWorkoutSharesForResource(resourceId)
    case 'entry':
      return fetchEntrySharesForResource(resourceId)
    case 'activity':
      return fetchActivitySharesForResource(resourceId)
  }
}

interface ShareModalProps {
  resourceType: ShareResourceType
  resourceId: string
  resourceName: string
  onClose: () => void
}

interface ExistingShare {
  id: string
  label: string
}

export default function ShareModal({
  resourceType,
  resourceId,
  resourceName,
  onClose,
}: ShareModalProps) {
  const loadKey = `${resourceType}:${resourceId}`
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ShareUserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [existingShares, setExistingShares] = useState<ExistingShare[]>([])
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [sharingUserId, setSharingUserId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    focusIfDesktop(searchRef.current)
  }, [])

  const loadingShares = loadedFor !== loadKey
  const trimmedQuery = query.trim()
  const visibleResults = trimmedQuery.length < 2 ? [] : results

  const loadExistingShares = async (forKey: string) => {
    try {
      const shares = await fetchSharesForResource(resourceType, resourceId)

      setExistingShares(
        shares.map((share) => ({
          id: share.id,
          label: share.sharedWithDisplayName,
        })),
      )
      setLoadedFor(forKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shares')
    }
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const shares = await fetchSharesForResource(resourceType, resourceId)

        if (cancelled) return

        setExistingShares(
          shares.map((share) => ({
            id: share.id,
            label: share.sharedWithDisplayName,
          })),
        )
        setLoadedFor(loadKey)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load shares')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [loadKey, resourceId, resourceType])

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return
    }

    const timer = window.setTimeout(async () => {
      setSearching(true)
      setError(null)
      try {
        setResults(await findUsersForShare(trimmedQuery))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [trimmedQuery])

  const handleShare = async (user: ShareUserResult) => {
    setSharingUserId(user.id)
    setError(null)
    setSuccess(null)
    try {
      if (resourceType === 'recipe') {
        await shareRecipe(resourceId, user.id, user.displayName)
      } else if (resourceType === 'workout') {
        await shareWorkout(resourceId, user.id, user.displayName)
      } else if (resourceType === 'entry') {
        await shareEntry(resourceId, user.id, user.displayName)
      } else {
        await shareActivity(resourceId, user.id, user.displayName)
      }
      setSuccess(`Shared with ${user.displayName}`)
      setQuery('')
      setResults([])
      await loadExistingShares(loadKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share')
    } finally {
      setSharingUserId(null)
    }
  }

  const handleRevoke = async (shareId: string) => {
    setRevokingId(shareId)
    setError(null)
    try {
      if (resourceType === 'recipe') {
        await revokeRecipeShare(shareId)
      } else if (resourceType === 'workout') {
        await revokeWorkoutShare(shareId)
      } else if (resourceType === 'entry') {
        await revokeEntryShare(shareId)
      } else {
        await revokeActivityShare(shareId)
      }
      await loadExistingShares(loadKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke share')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <Modal titleId="share-modal-title" onClose={onClose}>
      <h3
        id="share-modal-title"
        style={{
          fontFamily: "'Space Grotesk','Inter',sans-serif",
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 8px 0',
        }}
      >
        {SHARE_TITLES[resourceType]}
      </h3>
      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>{resourceName}</p>

      <label htmlFor="share-user-search" style={labelBase}>
        Email or display name
      </label>
      <input
        id="share-user-search"
        ref={searchRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users to share with..."
        style={{ ...inputBase, marginBottom: 12 }}
      />

      {searching && trimmedQuery.length >= 2 && (
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: '0 0 12px 0' }}>Searching...</p>
      )}

      {visibleResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {visibleResults.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleShare(user)}
              disabled={sharingUserId === user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid #e4e4e7',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{user.displayName}</span>
                <span style={{ display: 'block', fontSize: 12, color: '#71717a' }}>{user.emailHint}</span>
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#134e4b' }}>
                {sharingUserId === user.id ? 'Sharing...' : 'Share'}
              </span>
            </button>
          ))}
        </div>
      )}

      {trimmedQuery.length >= 2 && !searching && visibleResults.length === 0 && (
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: '0 0 16px 0' }}>No users found.</p>
      )}

      {success && (
        <p style={{ fontSize: 13, color: '#059669', margin: '0 0 12px 0' }} role="status">
          {success}
        </p>
      )}

      {error && (
        <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 12px 0' }} role="alert">
          {error}
        </p>
      )}

      <div style={{ marginTop: 8, marginBottom: 20 }}>
        <p style={{ ...labelBase, marginBottom: 8 }}>Shared with</p>
        {loadingShares ? (
          <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>Loading...</p>
        ) : existingShares.length === 0 ? (
          <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>Not shared with anyone yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {existingShares.map((share) => (
              <div
                key={share.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: '#fafafa',
                  border: '1px solid #e4e4e7',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500 }}>{share.label}</span>
                <button
                  type="button"
                  onClick={() => handleRevoke(share.id)}
                  disabled={revokingId === share.id}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {revokingId === share.id ? 'Removing...' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ ...primaryButton, background: '#52525b' }}>
          Done
        </button>
      </div>
    </Modal>
  )
}