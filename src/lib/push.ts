import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase-admin'
import { PushSubscriptionRecord } from '@/lib/types'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT ?? 'mailto:contato@decorafesta.app.br'

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

interface PushPayload {
  title: string
  body: string
  url: string
}

/** Envia uma notificação push pra todos os dispositivos inscritos.
 * Nunca lança: falha silenciosa (loga e segue) pra nunca travar o fluxo
 * principal (webhook do WhatsApp, extração de pedido) por causa de push. */
export async function sendPushToAll(payload: PushPayload): Promise<void> {
  if (!publicKey || !privateKey) return

  const supabase = createAdminClient()
  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs || subs.length === 0) return

  const body = JSON.stringify(payload)

  await Promise.all(
    (subs as PushSubscriptionRecord[]).map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          body
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        // Inscrição expirada ou revogada pelo navegador — remove pra não tentar de novo
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('[push] falha ao enviar', err)
        }
      }
    })
  )
}
