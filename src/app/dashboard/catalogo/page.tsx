import { redirect } from 'next/navigation'

// Catálogo foi unificado com o Inventário
export default function CatalogoPage() {
  redirect('/dashboard/inventario')
}
