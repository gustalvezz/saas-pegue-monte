interface Props {
  available: number
  total: number
  size?: 'sm' | 'md'
}

export default function AvailabilityBadge({ available, total, size = 'sm' }: Props) {
  const ratio = total === 0 ? 0 : available / total
  const color = ratio === 0 ? 'var(--coral)' : ratio < 0.5 ? 'var(--orange-brand)' : 'var(--green-dark)'
  const bg = ratio === 0 ? 'var(--coral-l)' : ratio < 0.5 ? 'var(--orange-l)' : 'var(--green-l)'

  const label = ratio === 0
    ? 'Esgotado'
    : `${available}/${total} disp.`

  return (
    <span
      className={`rounded-full font-extrabold ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{ color, background: bg }}
    >
      {label}
    </span>
  )
}
