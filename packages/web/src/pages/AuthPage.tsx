import { useState, type CSSProperties, type FormEvent } from 'react'
import { useAuth } from '../context/useAuth'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    if (mode === 'signup') {
      const { error: signUpError } = await signUp(email, password, displayName)
      setSubmitting(false)
      if (signUpError) {
        setError(signUpError)
        return
      }
      setMessage('Account created. You are signed in.')
      return
    }

    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) setError(signInError)
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '48px auto',
        padding: 32,
        background: 'white',
        borderRadius: 16,
        border: '1px solid #e4e4e7',
      }}
    >
      <h1
        style={{
          fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
          fontSize: 28,
          fontWeight: 600,
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em',
        }}
      >
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h1>
      <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 24px 0' }}>
        Track your daily nutrition with a private food log.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => {
            setMode('signin')
            setError(null)
            setMessage(null)
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e4e4e7',
            background: mode === 'signin' ? '#134e4b' : 'white',
            color: mode === 'signin' ? 'white' : '#3f3f46',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError(null)
            setMessage(null)
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e4e4e7',
            background: mode === 'signup' ? '#134e4b' : 'white',
            color: mode === 'signup' ? 'white' : '#3f3f46',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mode === 'signup' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              style={inputStyle}
            />
          </label>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            style={inputStyle}
          />
        </label>

        {error && (
          <p role="alert" style={{ margin: 0, fontSize: 13, color: '#dc2626' }}>
            {error}
          </p>
        )}
        {message && (
          <p role="status" style={{ margin: 0, fontSize: 13, color: '#059669' }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 8,
            padding: '12px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#134e4b',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e4e4e7',
  fontSize: 14,
}