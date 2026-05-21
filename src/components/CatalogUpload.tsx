'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { CatalogCategory } from '@/lib/types'

const CATEGORIES: CatalogCategory[] = ['aniversário', 'casamento', 'chá_bebê', 'debutante', 'outros']

interface Props {
  onUploaded: () => void
}

export default function CatalogUpload({ onUploaded }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CatalogCategory>('aniversário')
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    if (!file || !name.trim()) { setError('Nome e foto são obrigatórios'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `catalog/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('catalog').upload(path, file, { upsert: false })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage.from('catalog').getPublicUrl(path)
      const tags = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)

      const { error: insErr } = await supabase.from('catalog_items').insert({
        name: name.trim(),
        category,
        tags,
        image_url: publicUrl,
        active: true,
      })
      if (insErr) throw insErr

      setOpen(false)
      setFile(null)
      setPreview(null)
      setName('')
      setTagsInput('')
      onUploaded()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-white text-sm font-extrabold"
        style={{ background: 'var(--teal)' }}
      >
        + Nova foto
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5"
        style={{ background: '#fff', maxHeight: '90dvh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black" style={{ color: 'var(--dark)' }}>Nova foto do catálogo</h2>
          <button onClick={() => setOpen(false)} style={{ color: 'var(--mid)' }} className="text-xl leading-none">✕</button>
        </div>

        {/* Image picker */}
        <div
          className="rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer mb-4"
          style={{ borderColor: 'var(--border)', minHeight: 140, background: 'var(--bg)' }}
          onClick={() => inputRef.current?.click()}
        >
          {preview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview} alt="preview" className="rounded-xl max-h-40 object-contain" />
            : <p className="text-sm" style={{ color: 'var(--mid)' }}>Clique para escolher foto</p>
          }
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) pickFile(e.target.files[0]) }} />

        <div className="space-y-3">
          <div>
            <label className="field-label">Nome *</label>
            <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Decoração Princesa Rosa" />
          </div>
          <div>
            <label className="field-label">Categoria *</label>
            <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value as CatalogCategory)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Tags (separadas por vírgula)</label>
            <input className="field-input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="rosa, princesa, balões, dourado" />
          </div>
        </div>

        {error && <p className="text-xs mt-3 font-bold" style={{ color: 'var(--coral)' }}>{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 py-3 rounded-xl text-white font-extrabold text-sm disabled:opacity-50"
          style={{ background: 'var(--teal)' }}
        >
          {saving ? 'Salvando…' : 'Salvar foto'}
        </button>
      </div>
    </div>
  )
}
