'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { InventoryItem, ItemCategory, ItemMaterial } from '@/lib/types'

const CATEGORIES: ItemCategory[] = ['aniversário', 'casamento', 'chá_bebê', 'debutante', 'outros']
const MATERIALS: { value: ItemMaterial; label: string }[] = [
  { value: 'ceramica', label: 'Cerâmica' },
  { value: 'plastico', label: 'Plástico' },
  { value: 'mdf', label: 'MDF' },
  { value: 'acrilico', label: 'Acrílico' },
  { value: 'led', label: 'LED' },
  { value: 'tecido', label: 'Tecido' },
  { value: 'lona', label: 'Lona' },
  { value: 'outros', label: 'Outros' },
]

interface Props {
  initial?: Partial<InventoryItem>
  onSaved: () => void
  onClose: () => void
}

export default function InventoryItemForm({ initial, onSaved, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initial?.image_url ?? null)
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<ItemCategory>(initial?.category ?? 'aniversário')
  const [color, setColor] = useState(initial?.color ?? '')
  const [sizeDesc, setSizeDesc] = useState(initial?.size_description ?? '')
  const [material, setMaterial] = useState<ItemMaterial | ''>(initial?.material ?? '')
  const [qty, setQty] = useState(String(initial?.quantity_total ?? 1))
  const [replPrice, setReplPrice] = useState(String(initial?.replacement_price ?? ''))
  const [rentalPrice, setRentalPrice] = useState(String(initial?.rental_price_unit ?? ''))
  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function pickFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    if (!initial?.image_url && !file) { setError('Foto é obrigatória'); return }
    if (parseInt(qty) < 1) { setError('Quantidade deve ser ao menos 1'); return }

    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      let imageUrl = initial?.image_url ?? ''

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `catalog/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('catalog').upload(path, file, { upsert: false })
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('catalog').getPublicUrl(path)
        imageUrl = publicUrl
      }

      const tags = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      const payload = {
        name: name.trim(),
        category,
        color: color.trim() || null,
        size_description: sizeDesc.trim() || null,
        material: material || null,
        tags,
        image_url: imageUrl,
        quantity_total: parseInt(qty),
        replacement_price: replPrice ? parseFloat(replPrice) : null,
        rental_price_unit: rentalPrice ? parseFloat(rentalPrice) : null,
        active: true,
      }

      if (initial?.id) {
        const { error: updErr } = await supabase.from('inventory_items').update(payload).eq('id', initial.id)
        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase.from('inventory_items').insert(payload)
        if (insErr) throw insErr
      }

      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col"
        style={{ background: '#fff', maxHeight: '92dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-black text-base" style={{ color: 'var(--dark)' }}>
            {initial?.id ? 'Editar item' : 'Novo item do inventário'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--mid)' }} className="text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
          {/* Photo + camera */}
          <div
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
            style={{ borderColor: 'var(--border)', minHeight: 130, background: 'var(--bg)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={preview} alt="preview" className="rounded-xl max-h-36 object-contain" />
              : (
                <div className="text-center p-4">
                  <p className="text-3xl">📷</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--mid)' }}>
                    Toque para tirar foto ou escolher da galeria
                  </p>
                </div>
              )}
          </div>
          {/* capture="environment" faz o celular abrir a câmera traseira diretamente */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) pickFile(e.target.files[0]) }}
          />

          {/* Nome */}
          <div>
            <label className="field-label">Nome *</label>
            <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cachepô Branco MDF" />
          </div>

          {/* Categoria + Material */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Categoria *</label>
              <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value as ItemCategory)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Material</label>
              <select className="field-input" value={material} onChange={(e) => setMaterial(e.target.value as ItemMaterial | '')}>
                <option value="">—</option>
                {MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* Cor + Tamanho */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Cor</label>
              <input className="field-input" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Branco, Rosa, Dourado…" />
            </div>
            <div>
              <label className="field-label">Tamanho / medida</label>
              <input className="field-input" value={sizeDesc} onChange={(e) => setSizeDesc(e.target.value)} placeholder="P, M, G, 30cm…" />
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="field-label">Quantidade em estoque *</label>
            <input
              type="number"
              min={1}
              className="field-input"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="1"
            />
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Preço de locação (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                className="field-input"
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="field-label">Preço de reposição (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                className="field-input"
                value={replPrice}
                onChange={(e) => setReplPrice(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="field-label">Tags (separadas por vírgula)</label>
            <input
              className="field-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="princesa, rosa, balões, floral"
            />
          </div>

          {error && <p className="text-xs font-bold" style={{ color: 'var(--coral)' }}>{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-white font-extrabold text-sm disabled:opacity-50"
            style={{ background: 'var(--teal)' }}
          >
            {saving ? 'Salvando…' : initial?.id ? 'Salvar alterações' : 'Adicionar ao inventário'}
          </button>
        </div>
      </div>
    </div>
  )
}
