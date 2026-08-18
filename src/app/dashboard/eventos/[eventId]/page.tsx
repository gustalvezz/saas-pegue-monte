'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { DecoraEvent, EventItem, EventItemWithDetail, EventStatus, EventType, ReturnShipping, SpaceType } from '@/lib/types'
import { formatBRL } from '@/lib/utils'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import ItemPicker from '@/components/ItemPicker'

const STATUS_CFG: Record<EventStatus, { label: string; color: string; bg: string }> = {
  cotacao:     { label: 'Cotação',      color: 'var(--mid)',          bg: 'var(--border)' },
  confirmado:  { label: 'Confirmado',   color: 'var(--teal-d)',       bg: 'var(--teal-l)' },
  em_andamento:{ label: 'Em andamento', color: 'var(--orange-brand)', bg: 'var(--orange-l)' },
  concluido:   { label: 'Concluído',    color: 'var(--green-dark)',   bg: 'var(--green-l)' },
  cancelado:   { label: 'Cancelado',    color: 'var(--coral)',        bg: 'var(--coral-l)' },
}
const STATUS_FLOW: EventStatus[] = ['cotacao', 'confirmado', 'em_andamento', 'concluido']
const EVENT_TYPES: EventType[] = ['aniversário', 'casamento', 'chá_bebê', 'debutante', 'outros']
const SPACE_TYPES: { value: SpaceType; label: string }[] = [
  { value: 'interno', label: 'Interno' },
  { value: 'externo', label: 'Externo' },
  { value: 'misto', label: 'Misto' },
]
const RETURN_SHIPPING: { value: ReturnShipping; label: string }[] = [
  { value: 'locataria', label: 'Por conta da locatária' },
  { value: 'locadora', label: 'Por conta da locadora' },
  { value: 'retirada_locadora', label: 'Retirada pela locadora' },
]

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  const isNew = eventId === 'novo'
  const supabase = createClient()

  const [event, setEvent] = useState<DecoraEvent | null>(null)
  const [eventItems, setEventItems] = useState<EventItemWithDetail[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editMode, setEditMode] = useState(isNew)
  const [error, setError] = useState('')

  // Cliente
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCpf, setClientCpf] = useState('')
  const [clientRg, setClientRg] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [referenceName, setReferenceName] = useState('')
  const [referencePhone, setReferencePhone] = useState('')

  // Evento
  const [eventType, setEventType] = useState<EventType>('aniversário')
  const [eventDate, setEventDate] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [returnDeadlineTime, setReturnDeadlineTime] = useState('')
  const [venue, setVenue] = useState('')
  const [spaceType, setSpaceType] = useState<SpaceType | ''>('')
  const [themeNotes, setThemeNotes] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [notes, setNotes] = useState('')

  // Logística e valores
  const [deliveryFee, setDeliveryFee] = useState('')
  const [returnShipping, setReturnShipping] = useState<ReturnShipping | ''>('')
  const [depositAmount, setDepositAmount] = useState('')

  const fetchEvent = useCallback(async () => {
    const [{ data: ev }, { data: items }] = await Promise.all([
      supabase.from('events').select('*, customer:customers(*)').eq('id', eventId).single(),
      supabase.from('event_items').select('*, inventory_item:inventory_items(*)').eq('event_id', eventId),
    ])
    if (ev) {
      const e = ev as DecoraEvent & { customer: import('@/lib/types').Customer | null }
      setEvent(e)
      setClientName(e.client_name)
      setClientPhone(e.client_phone ?? '')
      setClientCpf(e.customer?.cpf ?? '')
      setClientRg(e.customer?.rg ?? '')
      setClientEmail(e.customer?.email ?? '')
      setClientAddress(e.customer?.address ?? '')
      setReferenceName(e.customer?.reference_name ?? '')
      setReferencePhone(e.customer?.reference_phone ?? '')
      setEventType(e.event_type ?? 'aniversário')
      setEventDate(e.event_date)
      setPickupDate(e.pickup_date)
      setReturnDate(e.return_date)
      setPickupTime(e.pickup_time ?? '')
      setReturnDeadlineTime(e.return_deadline_time ?? '')
      setVenue(e.venue ?? '')
      setSpaceType(e.space_type ?? '')
      setThemeNotes(e.theme_notes ?? '')
      setGuestCount(e.guest_count ? String(e.guest_count) : '')
      setNotes(e.notes ?? '')
      setDeliveryFee(e.delivery_fee ? String(e.delivery_fee) : '')
      setReturnShipping(e.return_shipping ?? '')
      setDepositAmount(e.deposit_amount ? String(e.deposit_amount) : '')
    }
    setEventItems((items ?? []) as EventItemWithDetail[])
    setLoading(false)
  }, [supabase, eventId])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      if (!isNew) fetchEvent()
    })
  }, [supabase, router, fetchEvent, isNew])

  // Prefill from URL search params (lead → event)
  useEffect(() => {
    if (!isNew) return
    const p = new URLSearchParams(window.location.search)
    if (p.get('client_name')) setClientName(p.get('client_name')!)
    if (p.get('client_phone')) setClientPhone(p.get('client_phone')!)
    if (p.get('event_type')) setEventType(p.get('event_type') as EventType)
    if (p.get('event_date')) { setEventDate(p.get('event_date')!); setPickupDate(p.get('event_date')!); setReturnDate(p.get('event_date')!) }
    if (p.get('venue')) setVenue(p.get('venue')!)
    if (p.get('theme_notes')) setThemeNotes(p.get('theme_notes')!)
    if (p.get('guest_count')) setGuestCount(p.get('guest_count')!)
  }, [isNew])

  async function handleSaveEvent() {
    if (!clientName.trim() || !eventDate || !pickupDate || !returnDate) {
      setError('Nome do cliente, data da festa, retirada e devolução são obrigatórios')
      return
    }
    setSaving(true)
    setError('')
    try {
      // Cliente: upsert em customers por telefone (quando informado), pra não duplicar cadastro
      let customerId: string | null = event?.customer_id ?? null
      const hasCustomerData = clientCpf.trim() || clientRg.trim() || clientEmail.trim() || clientAddress.trim()
      if (hasCustomerData || customerId) {
        const customerPayload = {
          name: clientName.trim(),
          cpf: clientCpf.trim(),
          rg: clientRg.trim() || null,
          phone: clientPhone.trim(),
          email: clientEmail.trim(),
          address: clientAddress.trim(),
          reference_name: referenceName.trim() || null,
          reference_phone: referencePhone.trim() || null,
        }
        if (customerId) {
          await supabase.from('customers').update(customerPayload).eq('id', customerId)
        } else if (clientPhone.trim()) {
          const { data: existing } = await supabase.from('customers').select('id').eq('phone', clientPhone.trim()).maybeSingle()
          if (existing) {
            customerId = existing.id
            await supabase.from('customers').update(customerPayload).eq('id', customerId)
          } else {
            const { data: created } = await supabase.from('customers').insert(customerPayload).select('id').single()
            customerId = created?.id ?? null
          }
        }
      }

      const payload = {
        client_name: clientName.trim(),
        client_phone: clientPhone.trim() || null,
        customer_id: customerId,
        event_type: eventType,
        event_date: eventDate,
        pickup_date: pickupDate,
        return_date: returnDate,
        pickup_time: pickupTime || null,
        return_deadline_time: returnDeadlineTime || null,
        venue: venue.trim() || null,
        space_type: spaceType || null,
        theme_notes: themeNotes.trim() || null,
        guest_count: guestCount ? parseInt(guestCount) : null,
        notes: notes.trim() || null,
        delivery_fee: deliveryFee ? parseFloat(deliveryFee) : 0,
        return_shipping: returnShipping || null,
        deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
        status: 'cotacao' as EventStatus,
      }
      if (isNew) {
        const { data: newEv, error: err } = await supabase.from('events').insert(payload).select().single()
        if (err) throw err
        router.replace(`/dashboard/eventos/${(newEv as DecoraEvent).id}`)
      } else {
        const { error: err } = await supabase.from('events').update(payload).eq('id', eventId)
        if (err) throw err
        await fetchEvent()
        setEditMode(false)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function syncCalendar(id: string, action: 'upsert' | 'delete') {
    fetch('/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: id, action }),
    }).catch(() => {/* non-fatal */})
  }

  async function handleStatusChange(newStatus: EventStatus) {
    await supabase.from('events').update({ status: newStatus }).eq('id', eventId)
    setEvent((prev) => prev ? { ...prev, status: newStatus } : prev)
    if (newStatus === 'confirmado' || newStatus === 'em_andamento') {
      syncCalendar(eventId, 'upsert')
    } else if (newStatus === 'cancelado') {
      syncCalendar(eventId, 'delete')
    }
  }

  async function handleItemsConfirm(
    selections: { item: import('@/lib/types').InventoryItemWithAvail; quantity: number; unit_price: number }[]
  ) {
    setPickerOpen(false)
    const supabase2 = createClient()
    // Remove all existing then insert new set
    await supabase2.from('event_items').delete().eq('event_id', eventId)
    if (selections.length > 0) {
      await supabase2.from('event_items').insert(
        selections.map((s) => ({
          event_id: eventId,
          inventory_item_id: s.item.id,
          quantity: s.quantity,
          unit_price: s.unit_price,
        }))
      )
    }
    await fetchEvent()
  }

  async function handleRemoveItem(itemId: string) {
    await supabase.from('event_items').delete().eq('event_id', eventId).eq('inventory_item_id', itemId)
    setEventItems((prev) => prev.filter((ei) => ei.inventory_item_id !== itemId))
  }

  const itemsTotal = eventItems.reduce((s, ei) => s + ei.quantity * ei.unit_price, 0)
  const total = itemsTotal + (event?.delivery_fee ?? 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-4xl animate-bounce">🎉</div>
      </div>
    )
  }

  const cfg = event ? STATUS_CFG[event.status] : null

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-5 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard/eventos" className="text-lg" style={{ color: 'var(--mid)' }}>←</Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-base truncate" style={{ color: 'var(--dark)' }}>
              {isNew ? 'Novo Evento' : event?.client_name}
            </h1>
            {cfg && (
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
                {cfg.label}
              </span>
            )}
          </div>
          {!isNew && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold"
              style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
            >
              Editar
            </button>
          )}
        </div>

        {/* Event form */}
        {(isNew || editMode) ? (
          <div className="space-y-4 mb-4">
            {/* Cliente */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
              <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>Cliente</p>
              <div>
                <label className="field-label">Nome *</label>
                <input className="field-input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome do cliente" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Telefone</label>
                  <input className="field-input" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input type="email" className="field-input" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="cliente@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">CPF</label>
                  <input className="field-input" value={clientCpf} onChange={(e) => setClientCpf(e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="field-label">RG</label>
                  <input className="field-input" value={clientRg} onChange={(e) => setClientRg(e.target.value)} placeholder="00.000.000-0" />
                </div>
              </div>
              <div>
                <label className="field-label">Endereço completo</label>
                <input className="field-input" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Rua, número, bairro, cidade — SP" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Pessoa de referência</label>
                  <input className="field-input" value={referenceName} onChange={(e) => setReferenceName(e.target.value)} placeholder="Nome (opcional)" />
                </div>
                <div>
                  <label className="field-label">Telefone da referência</label>
                  <input className="field-input" value={referencePhone} onChange={(e) => setReferencePhone(e.target.value)} placeholder="(11) 99999-9999" />
                </div>
              </div>
            </div>

            {/* Evento */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
              <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>Evento</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Tipo de festa</label>
                  <select className="field-input" value={eventType} onChange={(e) => setEventType(e.target.value as EventType)}>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Tipo de espaço</label>
                  <select className="field-input" value={spaceType} onChange={(e) => setSpaceType(e.target.value as SpaceType | '')}>
                    <option value="">—</option>
                    {SPACE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="field-label">Data da festa *</label>
                  <input type="date" className="field-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Retirada *</label>
                  <input type="date" className="field-input" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Devolução *</label>
                  <input type="date" className="field-input" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Horário de entrega/retirada</label>
                  <input type="time" className="field-input" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Horário-limite de devolução</label>
                  <input type="time" className="field-input" value={returnDeadlineTime} onChange={(e) => setReturnDeadlineTime(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Local</label>
                  <input className="field-input" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Salão, casa, sítio…" />
                </div>
                <div>
                  <label className="field-label">Convidados</label>
                  <input type="number" className="field-input" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="field-label">Tema / cores</label>
                <input className="field-input" value={themeNotes} onChange={(e) => setThemeNotes(e.target.value)} placeholder="Princesa rosa, tropical, minimalista…" />
              </div>
              <div>
                <label className="field-label">Observações</label>
                <textarea className="field-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas…" />
              </div>
            </div>

            {/* Logística e valores */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
              <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>Frete e sinal</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Frete de entrega (R$)</label>
                  <input type="number" min={0} step={0.01} className="field-input" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="0,00" />
                </div>
                <div>
                  <label className="field-label">Sinal (R$)</label>
                  <input type="number" min={0} step={0.01} className="field-input" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0,00" />
                </div>
              </div>
              <div>
                <label className="field-label">Frete de devolução</label>
                <select className="field-input" value={returnShipping} onChange={(e) => setReturnShipping(e.target.value as ReturnShipping | '')}>
                  <option value="">—</option>
                  {RETURN_SHIPPING.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-xs font-bold" style={{ color: 'var(--coral)' }}>{error}</p>}
            <div className="flex gap-2">
              {!isNew && (
                <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-bold"
                  style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}>
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSaveEvent}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white font-extrabold text-sm disabled:opacity-50"
                style={{ background: 'var(--purple-dark)' }}
              >
                {saving ? 'Salvando…' : isNew ? 'Criar evento' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : event && (
          <div className="rounded-2xl p-4 mb-4 grid grid-cols-2 gap-3 text-sm" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
            {[
              { label: 'Tipo de festa', value: event.event_type },
              { label: 'Convidados', value: event.guest_count?.toString() },
              { label: 'Data da festa', value: fmt(event.event_date) },
              { label: 'Local', value: event.venue },
              { label: 'Retirada', value: fmt(event.pickup_date) + (event.pickup_time ? ` às ${event.pickup_time}` : '') },
              { label: 'Devolução', value: fmt(event.return_date) + (event.return_deadline_time ? ` até ${event.return_deadline_time}` : '') },
              { label: 'Tema / cores', value: event.theme_notes },
              { label: 'Telefone', value: event.client_phone },
              { label: 'Tipo de espaço', value: event.space_type },
              { label: 'Frete de entrega', value: event.delivery_fee ? formatBRL(event.delivery_fee) : null },
              { label: 'Sinal', value: event.deposit_amount ? formatBRL(event.deposit_amount) : null },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ color: value ? 'var(--dark)' : 'var(--border)' }}>{value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Items section — only show after event created */}
        {!isNew && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-black text-sm" style={{ color: 'var(--dark)' }}>Itens da decoração</h2>
              <button
                onClick={() => setPickerOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-extrabold text-white"
                style={{ background: 'var(--teal)' }}
              >
                + Adicionar
              </button>
            </div>

            {eventItems.length === 0 ? (
              <div
                className="rounded-2xl p-6 text-center mb-4"
                style={{ background: '#fff', border: '1.5px dashed var(--border)' }}
              >
                <p className="text-2xl mb-1">🎈</p>
                <p className="text-sm" style={{ color: 'var(--mid)' }}>Nenhum item adicionado ainda</p>
                <button
                  onClick={() => setPickerOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl text-white text-xs font-extrabold"
                  style={{ background: 'var(--teal)' }}
                >
                  Escolher itens
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {eventItems.map((ei) => (
                  <div
                    key={ei.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: '#fff', borderColor: 'var(--border)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ei.inventory_item?.image_url}
                      alt={ei.inventory_item?.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold truncate" style={{ color: 'var(--dark)' }}>
                        {ei.inventory_item?.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--mid)' }}>
                        {ei.quantity}x · {formatBRL(ei.unit_price)}/un.
                      </p>
                      <AvailabilityBadge
                        available={ei.inventory_item?.quantity_total ?? 0}
                        total={ei.inventory_item?.quantity_total ?? 0}
                      />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-sm" style={{ color: 'var(--green-dark)' }}>
                        {formatBRL(ei.quantity * ei.unit_price)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(ei.inventory_item_id)}
                        className="text-xs"
                        style={{ color: 'var(--coral)' }}
                      >
                        remover
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--dark)', color: '#fff' }}
                >
                  <div>
                    <span className="font-extrabold text-sm">Total do evento</span>
                    {(event?.delivery_fee ?? 0) > 0 && (
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {formatBRL(itemsTotal)} + {formatBRL(event!.delivery_fee)} de frete
                      </p>
                    )}
                  </div>
                  <span className="font-black text-lg">{formatBRL(total)}</span>
                </div>
              </div>
            )}

            {/* Status flow */}
            {event && event.status !== 'cancelado' && (
              <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
                <p className="text-xs font-extrabold uppercase mb-3" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>
                  Avançar status
                </p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_FLOW.filter((s) => s !== event.status).map((s) => {
                    const c = STATUS_CFG[s]
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-extrabold"
                        style={{ borderColor: c.color, color: c.color }}
                      >
                        → {c.label}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handleStatusChange('cancelado')}
                    className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                    style={{ borderColor: 'var(--coral)', color: 'var(--coral)' }}
                  >
                    Cancelar evento
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {pickerOpen && event && (
        <ItemPicker
          pickupDate={event.pickup_date}
          returnDate={event.return_date}
          excludeEventId={event.id}
          existingItems={eventItems as EventItem[]}
          onConfirm={handleItemsConfirm}
          onClose={() => setPickerOpen(false)}
        />
      )}

    </div>
  )
}
