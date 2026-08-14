'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { InventoryItem, ItemMaterial, KitItemWithDetail, ProductCategory, TagOption } from '@/lib/types'
import { slugify } from '@/lib/utils'

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
  const supabase = createClient()

  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [tagOptions, setTagOptions] = useState<TagOption[]>([])
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryError, setNewCategoryError] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newTagOpen, setNewTagOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagError, setNewTagError] = useState('')
  const [creatingTag, setCreatingTag] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initial?.image_url ?? null)
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '')
  const [isKit, setIsKit] = useState(initial?.is_kit ?? false)
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug)
  const [color, setColor] = useState(initial?.color ?? '')
  const [sizeDesc, setSizeDesc] = useState(initial?.size_description ?? '')
  const [material, setMaterial] = useState<ItemMaterial | ''>(initial?.material ?? '')
  const [qty, setQty] = useState(String(initial?.quantity_total ?? 1))
  const [replPrice, setReplPrice] = useState(String(initial?.replacement_price ?? ''))
  const [rentalPrice, setRentalPrice] = useState(String(initial?.rental_price_unit ?? ''))
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tags ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState(initial?.id ?? null)
  const [justCreatedKit, setJustCreatedKit] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories((data ?? []) as ProductCategory[]))
    supabase.from('tag_options').select('*').order('name').then(({ data }) => setTagOptions((data ?? []) as TagOption[]))
  }, [supabase])

  // Auto-preenche o slug a partir do nome até o usuário editar manualmente
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  function pickFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function toggleTag(tagName: string) {
    setSelectedTags((prev) => (prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]))
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim()
    if (!name) { setNewCategoryError('Digite um nome'); return }
    const slug = slugify(name)
    if (categories.some((c) => c.slug === slug)) { setNewCategoryError('Já existe uma categoria com esse nome'); return }

    setCreatingCategory(true)
    setNewCategoryError('')
    try {
      const { data, error: insErr } = await supabase.from('categories').insert({ name, slug }).select().single()
      if (insErr) throw insErr
      const created = data as ProductCategory
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(created.id)
      setNewCategoryOpen(false)
      setNewCategoryName('')
    } catch (e: unknown) {
      setNewCategoryError(e instanceof Error ? e.message : 'Erro ao criar categoria')
    } finally {
      setCreatingCategory(false)
    }
  }

  async function handleCreateTag() {
    const name = newTagName.trim()
    if (!name) { setNewTagError('Digite um nome'); return }
    const slug = slugify(name)
    if (tagOptions.some((t) => t.slug === slug)) { setNewTagError('Já existe uma tag com esse nome'); return }

    setCreatingTag(true)
    setNewTagError('')
    try {
      const { data, error: insErr } = await supabase.from('tag_options').insert({ name, slug }).select().single()
      if (insErr) throw insErr
      const created = data as TagOption
      setTagOptions((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedTags((prev) => [...prev, created.slug])
      setNewTagOpen(false)
      setNewTagName('')
    } catch (e: unknown) {
      setNewTagError(e instanceof Error ? e.message : 'Erro ao criar tag')
    } finally {
      setCreatingTag(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    if (!initial?.image_url && !file) { setError('Foto é obrigatória'); return }
    if (parseInt(qty) < 1) { setError('Quantidade deve ser ao menos 1'); return }
    if (!categoryId) { setError('Categoria é obrigatória'); return }
    if (!slug.trim()) { setError('URL (slug) é obrigatória'); return }

    setSaving(true)
    setError('')
    try {
      let imageUrl = initial?.image_url ?? ''

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `catalog/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('catalog').upload(path, file, { upsert: false })
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('catalog').getPublicUrl(path)
        imageUrl = publicUrl
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        category_id: categoryId,
        is_kit: isKit,
        slug: slugify(slug),
        color: color.trim() || null,
        size_description: sizeDesc.trim() || null,
        material: material || null,
        tags: selectedTags,
        image_url: imageUrl,
        quantity_total: parseInt(qty),
        replacement_price: replPrice ? parseFloat(replPrice) : null,
        rental_price_unit: rentalPrice ? parseFloat(rentalPrice) : null,
        active: true,
      }

      if (savedId) {
        const { error: updErr } = await supabase.from('inventory_items').update(payload).eq('id', savedId)
        if (updErr) throw updErr
        onSaved()
        onClose()
      } else {
        const { data: inserted, error: insErr } = await supabase.from('inventory_items').insert(payload).select().single()
        if (insErr) throw insErr
        onSaved()
        if (isKit) {
          // Mantém o modal aberto, agora em modo edição, pra já vincular os componentes do kit
          setSavedId((inserted as InventoryItem).id)
          setJustCreatedKit(true)
        } else {
          onClose()
        }
      }
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
            {savedId ? 'Editar item' : 'Novo item do inventário'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--mid)' }} className="text-xl leading-none">✕</button>
        </div>

        {justCreatedKit && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-lg text-xs font-bold" style={{ background: 'var(--teal-l)', color: 'var(--teal-d)' }}>
            ✅ Kit criado! Agora adicione os itens que compõem ele logo abaixo.
          </div>
        )}

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

          {/* Descrição — usada na página pública e no SEO */}
          <div>
            <label className="field-label">Descrição</label>
            <textarea
              className="field-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Material, cor, tamanho, para qual ocasião combina… (aparece na página pública do item)"
            />
          </div>

          {/* URL (slug) */}
          <div>
            <label className="field-label">URL do item (slug)</label>
            <input
              className="field-input"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
              placeholder="cachepô-branco-mdf"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--light)' }}>decorafesta.app.br/produto/{slug || '...'}</p>
          </div>

          {/* Categoria + Material */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Categoria *</label>
              <select
                className="field-input"
                value={categoryId}
                onChange={(e) => {
                  if (e.target.value === '__new__') { setNewCategoryOpen(true); return }
                  setCategoryId(e.target.value)
                }}
              >
                <option value="">Selecione…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__new__">+ Nova categoria…</option>
              </select>

              {newCategoryOpen && (
                <div className="mt-2 p-2.5 rounded-lg" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                  <label className="field-label">Nome da nova categoria</label>
                  <input
                    className="field-input"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Painéis Temáticos"
                    autoFocus
                  />
                  {newCategoryError && <p className="text-xs font-bold mt-1" style={{ color: 'var(--coral)' }}>{newCategoryError}</p>}
                  <div className="flex gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory}
                      className="flex-1 py-1.5 rounded-lg text-white text-xs font-extrabold disabled:opacity-60"
                      style={{ background: 'var(--teal)' }}
                    >
                      {creatingCategory ? 'Criando…' : 'Criar e usar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNewCategoryOpen(false); setNewCategoryName(''); setNewCategoryError('') }}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                      style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Material</label>
              <select className="field-input" value={material} onChange={(e) => setMaterial(e.target.value as ItemMaterial | '')}>
                <option value="">—</option>
                {MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* É um kit? */}
          <label className="flex items-center gap-2 px-1 py-1 cursor-pointer">
            <input type="checkbox" checked={isKit} onChange={(e) => setIsKit(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
              Este item é um kit (reúne outros itens do inventário)
            </span>
          </label>

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

          {/* Tags pré-cadastradas */}
          <div>
            <label className="field-label">Tags (ocasião, público, tema…)</label>
            <div className="flex flex-wrap gap-1.5">
              {tagOptions.map((t) => {
                const active = selectedTags.includes(t.slug)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.slug)}
                    className="px-2.5 py-1 rounded-full border text-xs font-bold transition-all"
                    style={{
                      borderColor: active ? 'var(--teal)' : 'var(--border)',
                      background: active ? 'var(--teal)' : 'transparent',
                      color: active ? '#fff' : 'var(--mid)',
                    }}
                  >
                    {t.name}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setNewTagOpen(true)}
                className="px-2.5 py-1 rounded-full border border-dashed text-xs font-bold"
                style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
              >
                + Nova tag…
              </button>
            </div>

            {newTagOpen && (
              <div className="mt-2 p-2.5 rounded-lg" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                <label className="field-label">Nome da nova tag</label>
                <input
                  className="field-input"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ex: Toy Story"
                  autoFocus
                />
                {newTagError && <p className="text-xs font-bold mt-1" style={{ color: 'var(--coral)' }}>{newTagError}</p>}
                <div className="flex gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={creatingTag}
                    className="flex-1 py-1.5 rounded-lg text-white text-xs font-extrabold disabled:opacity-60"
                    style={{ background: 'var(--teal)' }}
                  >
                    {creatingTag ? 'Criando…' : 'Criar e usar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewTagOpen(false); setNewTagName(''); setNewTagError('') }}
                    className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                    style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-xs font-bold" style={{ color: 'var(--coral)' }}>{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-white font-extrabold text-sm disabled:opacity-50"
            style={{ background: 'var(--teal)' }}
          >
            {saving ? 'Salvando…' : savedId ? 'Salvar alterações' : 'Adicionar ao inventário'}
          </button>

          {/* Componentes do kit — só disponível depois de criado */}
          {savedId && isKit && <KitComponentsEditor kitId={savedId} />}

          {justCreatedKit && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border text-sm font-extrabold"
              style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function KitComponentsEditor({ kitId }: { kitId: string }) {
  const supabase = createClient()
  const [components, setComponents] = useState<KitItemWithDetail[]>([])
  const [candidates, setCandidates] = useState<InventoryItem[]>([])
  const [addingId, setAddingId] = useState('')
  const [addingQty, setAddingQty] = useState('1')
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    const [{ data: comps }, { data: items }] = await Promise.all([
      supabase.from('kit_items').select('*, component:inventory_items!kit_items_component_item_id_fkey(*)').eq('kit_id', kitId),
      supabase.from('inventory_items').select('*').eq('active', true).eq('is_kit', false).order('name'),
    ])
    setComponents((comps ?? []) as KitItemWithDetail[])
    setCandidates((items ?? []) as InventoryItem[])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [kitId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd() {
    if (!addingId || parseInt(addingQty) < 1) return
    await supabase.from('kit_items').insert({
      kit_id: kitId,
      component_item_id: addingId,
      quantity: parseInt(addingQty),
    })
    setAddingId('')
    setAddingQty('1')
    fetchAll()
  }

  async function handleRemove(id: string) {
    await supabase.from('kit_items').delete().eq('id', id)
    fetchAll()
  }

  const availableCandidates = candidates.filter((c) => !components.some((k) => k.component_item_id === c.id))

  return (
    <div className="rounded-xl p-3 mt-2" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
      <p className="text-xs font-extrabold uppercase mb-2" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>
        Conteúdo do kit
      </p>

      {loading ? (
        <p className="text-xs" style={{ color: 'var(--mid)' }}>Carregando…</p>
      ) : (
        <>
          {components.length === 0 && (
            <p className="text-xs mb-2" style={{ color: 'var(--mid)' }}>Nenhum componente adicionado ainda</p>
          )}
          <div className="space-y-1.5 mb-2">
            {components.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-2.5 py-1.5">
                <span style={{ color: 'var(--dark)' }}>{c.quantity}x {c.component?.name}</span>
                <button onClick={() => handleRemove(c.id)} style={{ color: 'var(--coral)' }}>remover</button>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            <select className="field-input flex-1" style={{ fontSize: 12 }} value={addingId} onChange={(e) => setAddingId(e.target.value)}>
              <option value="">Adicionar item…</option>
              {availableCandidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="number"
              min={1}
              className="field-input"
              style={{ width: 56, fontSize: 12 }}
              value={addingQty}
              onChange={(e) => setAddingQty(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 rounded-lg text-white text-xs font-extrabold"
              style={{ background: 'var(--teal)' }}
            >
              +
            </button>
          </div>
        </>
      )}
    </div>
  )
}
