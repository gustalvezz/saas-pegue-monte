export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">📶</div>
        <h1 className="text-xl font-bold text-brand-dark mb-2">Sem conexão</h1>
        <p className="text-sm text-brand-mid">Verifique sua internet e tente novamente.</p>
      </div>
    </div>
  )
}
