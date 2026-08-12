'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Decora Festa" className="h-24 w-auto mb-2" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-brand-dark mb-5">Entrar na conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-coral-light text-coral text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-brand-light mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm font-semibold outline-none focus:ring-2"
                style={{ borderColor: 'var(--border)', color: 'var(--dark)' }}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-brand-light mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm font-semibold outline-none focus:ring-2"
                style={{ borderColor: 'var(--border)', color: 'var(--dark)' }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm mt-2 disabled:opacity-60 active:scale-95 transition-transform"
              style={{ background: 'var(--teal)' }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-brand-light mt-6">
          Decora Festa © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
