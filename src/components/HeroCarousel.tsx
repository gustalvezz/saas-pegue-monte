'use client'

import { useEffect, useState } from 'react'
import SafeImage from '@/components/SafeImage'

interface Props {
  images: string[]
  intervalMs?: number
}

export default function HeroCarousel({ images, intervalMs = 4500 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [images.length, intervalMs])

  if (images.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '21 / 9', background: 'var(--border)' }}>
      {images.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
        >
          <SafeImage src={src} alt="Decoração Decora Festa" fill sizes="100vw" className="object-cover" priority={i === 0} />
        </div>
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Foto ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className="rounded-full transition-all"
              style={{
                width: i === activeIndex ? 18 : 6,
                height: 6,
                background: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
