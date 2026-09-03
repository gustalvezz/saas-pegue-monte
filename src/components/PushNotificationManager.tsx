'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

export default function PushNotificationManager() {
  const [status, setStatus] = useState<'checking' | 'unsupported' | 'offer' | 'subscribing' | 'active' | 'denied'>('checking')

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription()
      setStatus(existing ? 'active' : 'offer')
    })
  }, [])

  async function handleActivate() {
    if (!VAPID_PUBLIC_KEY) return
    setStatus('subscribing')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'offer')
        return
      }
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })
      setStatus('active')
    } catch (err) {
      console.error('[push] falha ao ativar', err)
      setStatus('offer')
    }
  }

  if (status !== 'offer' && status !== 'subscribing') return null

  return (
    <div
      className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 sm:mx-6"
      style={{ borderColor: 'var(--teal)', background: 'var(--teal-l)' }}
    >
      <p className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
        🔔 Ativar notificações de novo lead e pedido?
      </p>
      <button
        onClick={handleActivate}
        disabled={status === 'subscribing'}
        className="shrink-0 rounded-full px-4 py-2 text-xs font-extrabold text-white transition-all disabled:opacity-60"
        style={{ background: 'var(--teal)' }}
      >
        {status === 'subscribing' ? 'Ativando…' : 'Ativar'}
      </button>
    </div>
  )
}
