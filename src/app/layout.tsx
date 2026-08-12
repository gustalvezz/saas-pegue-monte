import type { Metadata, Viewport } from 'next'
import './globals.css'

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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4ECDC4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-brand-bg min-h-screen font-nunito antialiased">
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
