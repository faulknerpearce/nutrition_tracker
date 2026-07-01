import { useMemo, useState } from 'react'
import {
  canComputeBmrFromBodyStats,
  computeMifflinStJeorBmr,
  resolveBmr,
  type ProfileGender,
  type ProfileUpdate,
  type UserProfile,
} from '@nutrition-tracker/shared'
import GoalsFormFields from '../components/GoalsFormFields'
import PageHeader from '../components/layout/PageHeader'
import { PageLoading } from '../components/layout/PageState'
import ZoneButton from '../components/layout/ZoneButton'
import { useProfile } from '../context/useProfile'
import { defaultGoalsForm, normalizeGoals } from '../lib/goalsForm'
import { inputBase, labelBase } from '../lib/styles'

function optionalInt(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function optionalWeight(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : null
}

const GENDER_OPTIONS: { value: ProfileGender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

function profileFormKey(profile: UserProfile): string {
  return [
    profile.displayName,
    profile.age ?? '',
    profile.heightCm ?? '',
    profile.weightKg ?? '',
    profile.gender,
    profile.bmrOverride ?? '',
    JSON.stringify(profile.nutritionGoals),
  ].join('|')
}

interface ProfileFormProps {
  profile: UserProfile
  updateProfile: (update: ProfileUpdate) => Promise<{ error: string | null }>
}

function ProfileForm({ profile, updateProfile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [age, setAge] = useState(profile.age === null ? '' : String(profile.age))
  const [heightCm, setHeightCm] = useState(profile.heightCm === null ? '' : String(profile.heightCm))
  const [weightKg, setWeightKg] = useState(profile.weightKg === null ? '' : String(profile.weightKg))
  const [gender, setGender] = useState<ProfileGender>(profile.gender)
  const [bmrOverride, setBmrOverride] = useState(
    profile.bmrOverride === null ? '' : String(profile.bmrOverride),
  )
  const [goalsForm, setGoalsForm] = useState(() => structuredClone(profile.nutritionGoals))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const draftProfile = useMemo(
    () => ({
      age: optionalInt(age),
      heightCm: optionalInt(heightCm),
      weightKg: optionalWeight(weightKg),
      gender,
      bmrOverride: optionalWeight(bmrOverride),
    }),
    [age, heightCm, weightKg, gender, bmrOverride],
  )

  const calculatedBmr = useMemo(() => {
    if (!canComputeBmrFromBodyStats(draftProfile)) return null
    return computeMifflinStJeorBmr({
      weightKg: draftProfile.weightKg!,
      heightCm: draftProfile.heightCm!,
      age: draftProfile.age!,
      gender: draftProfile.gender,
    })
  }, [draftProfile])

  const activeBmr = useMemo(() => resolveBmr(draftProfile), [draftProfile])

  const resetGoalsDefaults = () => {
    setGoalsForm(defaultGoalsForm())
    setError(null)
    setSaved(false)
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await updateProfile({
      displayName,
      age: draftProfile.age,
      heightCm: draftProfile.heightCm,
      weightKg: draftProfile.weightKg,
      gender: draftProfile.gender,
      bmrOverride: draftProfile.bmrOverride,
      nutritionGoals: normalizeGoals(goalsForm),
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSaved(true)
  }

  return (
    <>
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

      {saved && (
        <div
          role="status"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: '#ecfdf5',
            color: '#047857',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          Profile saved.
        </div>
      )}

      <section className="day-accordion" style={{ padding: 24, marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          Basic Information
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
          Optional details to keep your account up to date.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="profile-display-name" style={labelBase}>
              Display name
            </label>
            <input
              id="profile-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How your name appears in the app"
              style={inputBase}
            />
          </div>

          <div className="modal-form-grid">
            <div>
              <label htmlFor="profile-age" style={labelBase}>
                Age
              </label>
              <input
                id="profile-age"
                type="number"
                min="13"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-height" style={labelBase}>
                Height (cm)
              </label>
              <input
                id="profile-height"
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-weight" style={labelBase}>
                Weight (kg)
              </label>
              <input
                id="profile-weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-gender" style={labelBase}>
                Gender
              </label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as ProfileGender)}
                style={inputBase}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="day-accordion" style={{ padding: 24, marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          Basal Metabolic Rate
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
          BMR is included automatically in daily output on the dashboard. Calculated with
          Mifflin-St Jeor from age, height, weight, and gender.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            <div style={{ padding: '14px 16px', borderRadius: 12, background: '#f4f4f5' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#71717a', margin: '0 0 6px 0' }}>
                Calculated BMR
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, margin: 0, color: '#18181b' }}>
                {calculatedBmr !== null ? `${calculatedBmr.toLocaleString()} kcal` : '—'}
              </p>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 12, background: '#ecfdf5' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#047857', margin: '0 0 6px 0' }}>
                Active BMR
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, margin: 0, color: '#047857' }}>
                {activeBmr.bmr.toLocaleString()} kcal
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="profile-bmr-override" style={labelBase}>
              Manual BMR override (kcal)
            </label>
            <input
              id="profile-bmr-override"
              type="number"
              min="800"
              max="5000"
              step="1"
              value={bmrOverride}
              onChange={(e) => setBmrOverride(e.target.value)}
              placeholder="Optional — replaces calculated BMR"
              style={inputBase}
            />
            <p style={{ fontSize: 12, color: '#a1a1aa', margin: '8px 0 0 0' }}>
              {activeBmr.source === 'override'
                ? 'Using your manual override for daily output.'
                : activeBmr.source === 'fallback'
                  ? 'Add age, height, and weight to calculate BMR, or set a manual override.'
                  : 'Using calculated BMR for daily output.'}
            </p>
          </div>
        </div>
      </section>

      <section className="day-accordion" style={{ padding: 24, marginBottom: 24 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          Daily Goals
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
          These targets power the dashboard and inputs panels. Calories and protein ranges also set
          the net energy goal band.
        </p>

        <GoalsFormFields form={goalsForm} onChange={setGoalsForm} idPrefix="profile-goal" />
      </section>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <ZoneButton onClick={resetGoalsDefaults}>Reset goal defaults</ZoneButton>
        <ZoneButton variant="primary" onClick={submit} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </ZoneButton>
      </div>
    </>
  )
}

export default function ProfilePage() {
  const { profile, loading, updateProfile } = useProfile()

  if (loading) return <PageLoading message="Loading profile..." />

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your basic information and daily nutrition targets."
      />

      <ProfileForm
        key={profileFormKey(profile)}
        profile={profile}
        updateProfile={updateProfile}
      />
    </div>
  )
}