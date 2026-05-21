import { Conversation } from '@/lib/types'

interface Props {
  message: Conversation
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatBubble({ message }: Props) {
  const isOut = message.direction === 'outbound'

  return (
    <div className={`flex mb-2 ${isOut ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[78%] rounded-2xl px-3 py-2"
        style={{
          background: isOut ? 'var(--teal)' : '#fff',
          borderBottomRightRadius: isOut ? 4 : undefined,
          borderBottomLeftRadius: isOut ? undefined : 4,
          border: isOut ? 'none' : '1.5px solid var(--border)',
        }}
      >
        {message.media_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.media_url}
            alt={message.message_text ?? 'foto'}
            className="rounded-xl mb-1.5 max-w-full"
            style={{ maxHeight: 220, objectFit: 'cover' }}
          />
        )}
        {message.message_text && (
          <p
            className="text-sm leading-snug whitespace-pre-wrap"
            style={{ color: isOut ? '#fff' : 'var(--dark)' }}
          >
            {message.message_text}
          </p>
        )}
        <p
          className="text-xs mt-1 text-right"
          style={{ color: isOut ? 'rgba(255,255,255,0.7)' : 'var(--light)' }}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
