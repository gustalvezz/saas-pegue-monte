const BASE_URL = process.env.EVOLUTION_API_URL ?? ''
const API_KEY = process.env.EVOLUTION_API_KEY ?? ''
const INSTANCE = process.env.EVOLUTION_INSTANCE_NAME ?? 'decora-festa'

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution API error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function sendText(phone: string, text: string) {
  return post(`/message/sendText/${INSTANCE}`, {
    number: phone,
    text,
    delay: 1000,
  })
}

export async function sendImage(phone: string, imageUrl: string, caption?: string) {
  return post(`/message/sendMedia/${INSTANCE}`, {
    number: phone,
    mediatype: 'image',
    media: imageUrl,
    caption: caption ?? '',
    delay: 1000,
  })
}

export async function getInstanceStatus(): Promise<{ state: string }> {
  const res = await fetch(`${BASE_URL}/instance/connectionState/${INSTANCE}`, {
    headers: { apikey: API_KEY },
  })
  if (!res.ok) return { state: 'unknown' }
  const data = await res.json()
  return { state: data?.instance?.state ?? 'unknown' }
}
