import type { Metadata, Viewport } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://decorafesta.app.br'
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511973110669'
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/decorafesta.jundiai'

export const metadata: Metadata = {
  title: 'Decora Festa · Financeiro',
  description: 'Controle financeiro para locação de decorações para festas',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Decora Festa',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decora Festa — Locação de Decoração para Festas',
    description: 'Kits prontos ou itens avulsos para locação de decoração. Reserve online em minutos.',
    images: [`${APP_URL}/logo.png`],
  },
  other: {
    'geo.placename': 'Jundiaí, São Paulo, Brasil',
    'geo.region': 'BR-SP',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4ECDC4',
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${APP_URL}/#negocio`,
  name: 'Decora Festa',
  description: 'Empresa de locação de decoração para festas em Jundiaí e região — kits pegue e monte ou itens avulsos, para festas infantis, adultas, chá revelação, casamentos, aniversários e eventos corporativos.',
  image: `${APP_URL}/logo.png`,
  logo: `${APP_URL}/logo.png`,
  url: APP_URL,
  telephone: `+${WHATSAPP_NUMBER}`,
  priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: 'Jundiaí', addressRegion: 'SP', addressCountry: 'BR' },
  areaServed: [
    { '@type': 'City', name: 'Jundiaí' },
    { '@type': 'City', name: 'Várzea Paulista' },
    { '@type': 'City', name: 'Campo Limpo Paulista' },
    { '@type': 'City', name: 'Itupeva' },
    { '@type': 'City', name: 'Louveira' },
    { '@type': 'City', name: 'Cabreúva' },
    { '@type': 'City', name: 'Indaiatuba' },
  ],
  sameAs: [INSTAGRAM_URL],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-brand-bg min-h-screen font-nunito antialiased">
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {})
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
