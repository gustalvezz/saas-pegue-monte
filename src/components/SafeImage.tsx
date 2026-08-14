import Image from 'next/image'

const OPTIMIZABLE_HOSTS = ['supabase.co']

function isOptimizable(src: string): boolean {
  try {
    const { hostname } = new URL(src)
    return OPTIMIZABLE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

interface Props {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

/** Usa next/image (otimizado) quando o domínio é conhecido; cai para <img>
 * comum em qualquer outra URL, para nunca derrubar a página por uma foto
 * fora do padrão esperado. */
export default function SafeImage({ src, alt, fill, sizes, width, height, className, priority }: Props) {
  if (!isOptimizable(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } : undefined} />
  }

  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />
  }

  return <Image src={src} alt={alt} width={width ?? 400} height={height ?? 400} className={className} priority={priority} />
}
