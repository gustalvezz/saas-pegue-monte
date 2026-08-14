'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { HeroImage } from '@/lib/types'

export default function VitrinePage() {
  const router = useRouter()
  const supabase = createClient()
  const [images, setImages] = useState<HeroImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = useCallback(async () => {
    const { data } = await supabase.from('hero_images').select('*').order('display_order')
    setImages((data ?? []) as HeroImage[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetchImages()
    })
  }, [supabase, router, fetchImages])

  async function handleUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `hero/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('catalog').upload(path, file, { upsert: false })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('catalog').getPublicUrl(path)

      const nextOrder = images.length > 0 ? Math.max(...images.map((i) => i.display_order)) + 1 : 0
      const { error: insErr } = await supabase.from('hero_images').insert({
        image_url: publicUrl,
        display_order: nextOrder,
        active: true,
      })
      if (insErr) throw insErr

      await fetchImages()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  async function toggleActive(img: HeroImage) {
    await supabase.from('hero_images').update({ active: !img.active }).eq('id', img.id)
    fetchImages()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover essa foto do hero?')) return
    await supabase.from('hero_images').delete().eq('id', id)
    fetchImages()
  }

  async function move(img: HeroImage, direction: -1 | 1) {
    const sorted = [...images].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((i) => i.id === img.id)
    const swapWith = sorted[idx + direction]
    if (!swapWith) return

    await Promise.all([
      supabase.from('hero_images').update({ display_order: swapWith.display_order }).eq('id', img.id),
      supabase.from('hero_images').update({ display_order: img.display_order }).eq('id', swapWith.id),
    ])
    fetchImages()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-4xl animate-bounce">🖼️</div>
      </div>
    )
  }

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-lg" style={{ color: 'var(--mid)' }}>←</Link>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--teal), var(--purple-dark))' }}
          >
            🖼️
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--dark)' }}>
              Decora Festa <span style={{ color: 'var(--teal)' }}>· Vitrine</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--mid)' }}>
              Fotos do carrossel na home da loja pública
            </p>
          </div>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--mid)' }}>
          Enquanto nenhuma foto for cadastrada aqui, o carrossel mostra automaticamente as fotos dos kits.
          Assim que você adicionar pelo menos uma foto, ela substitui esse padrão.
        </p>

        {/* Upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer mb-5"
          style={{ borderColor: 'var(--border)', minHeight: 100, background: '#fff' }}
        >
          {uploading ? (
            <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Enviando…</p>
          ) : (
            <div className="text-center p-4">
              <p className="text-2xl">📷</p>
              <p className="text-sm mt-1 font-bold" style={{ color: 'var(--mid)' }}>Adicionar foto ao carrossel</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }}
        />

        {error && <p className="text-xs font-bold mb-4" style={{ color: 'var(--coral)' }}>{error}</p>}

        {/* List */}
        {sorted.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'var(--mid)' }}>
            Nenhuma foto cadastrada ainda — usando as fotos dos kits por padrão.
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-3 p-2.5 rounded-xl border" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" style={{ opacity: img.active ? 1 : 0.4 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: img.active ? 'var(--green-dark)' : 'var(--light)' }}>
                    {img.active ? 'Visível no carrossel' : 'Oculta'}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => move(img, -1)} disabled={idx === 0} className="text-xs font-bold disabled:opacity-30" style={{ color: 'var(--mid)' }}>↑</button>
                    <button onClick={() => move(img, 1)} disabled={idx === sorted.length - 1} className="text-xs font-bold disabled:opacity-30" style={{ color: 'var(--mid)' }}>↓</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(img)}
                    className="px-2.5 py-1 rounded-lg text-xs font-extrabold"
                    style={{ background: img.active ? 'var(--border)' : 'var(--teal-l)', color: img.active ? 'var(--mid)' : 'var(--teal-d)' }}
                  >
                    {img.active ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-extrabold"
                    style={{ background: 'var(--coral-l)', color: 'var(--coral)' }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
