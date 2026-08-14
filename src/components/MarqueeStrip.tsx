const ITEMS = ['Festa Infantil', 'Festa Adulta', 'Chá Revelação', 'Casamentos', 'Aniversários', 'Eventos Corporativos']

function Track() {
  return (
    <span>
      {ITEMS.map((item, i) => (
        <span key={i}>
          {item} <span style={{ color: 'var(--store-gold-l)' }}>•</span>{' '}
        </span>
      ))}
    </span>
  )
}

export default function MarqueeStrip() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <Track />
        <Track />
      </div>
    </div>
  )
}
