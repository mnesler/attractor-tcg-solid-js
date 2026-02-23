import { createSignal, For, Show, onMount } from 'solid-js'
import { sendChatMessage } from '~/lib/server/chat'
import type { ChatMessage, ChatResult } from '~/lib/types'

// createServerFn without inputValidator types data as undefined at call site;
// cast to any to pass runtime data through.
type AnyChatFn = (opts?: { data?: unknown }) => Promise<ChatResult>

interface ChatProps {
  deckContext: string
}

export default function Chat(props: ChatProps) {
  const [messages, setMessages] = createSignal<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I can help you analyze and improve your EDH deck. Ask me about card synergies, replacements, upgrades, or strategy.',
    },
  ])
  const [input, setInput] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  let messagesEndRef: HTMLDivElement | undefined
  let inputRef: HTMLTextAreaElement | undefined

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' })
  }

  const send = async () => {
    const text = input().trim()
    if (!text || loading()) return

    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text }
    const newMessages = [...messages(), userMsg]
    setMessages(newMessages)
    setLoading(true)

    // Small delay for smooth UX
    setTimeout(scrollToBottom, 50)

    try {
      const result = await (sendChatMessage as AnyChatFn)({
        data: {
          messages: newMessages,
          deckContext: props.deckContext,
        },
      })

      if ('error' in result && result.error) {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: result.error! },
        ])
      } else if ('content' in result && result.content) {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: result.content! },
        ])
      }
    } catch (_e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Failed to connect to AI. Please try again.',
        },
      ])
    }

    setLoading(false)
    setTimeout(scrollToBottom, 50)
    inputRef?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <aside class="chat-sidebar">
      <div class="chat-header">
        <span class="chat-icon">◈</span>
        <h2 class="chat-title">Deck Assistant</h2>
      </div>

      <div class="chat-messages" id="chat-messages-list">
        <For each={messages()}>
          {(msg) => (
            <div class="chat-message" classList={{ user: msg.role === 'user', assistant: msg.role === 'assistant' }}>
              <Show when={msg.role === 'assistant'}>
                <span class="chat-avatar assistant-avatar">AI</span>
              </Show>
              <div class="chat-bubble">
                <p class="chat-bubble-text">{msg.content}</p>
              </div>
              <Show when={msg.role === 'user'}>
                <span class="chat-avatar user-avatar">You</span>
              </Show>
            </div>
          )}
        </For>

        <Show when={loading()}>
          <div class="chat-message assistant">
            <span class="chat-avatar assistant-avatar">AI</span>
            <div class="chat-bubble">
              <div class="chat-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </Show>

        <div ref={messagesEndRef} />
      </div>

      <div class="chat-input-area">
        <textarea
          ref={inputRef}
          class="chat-input"
          placeholder="Ask about your deck..."
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={loading()}
        />
        <button
          class="chat-send-btn"
          onClick={() => void send()}
          disabled={loading() || !input().trim()}
          aria-label="Send message"
        >
          <Show when={loading()} fallback={<>Send ▶</>}>
            <span class="chat-loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </Show>
        </button>
      </div>
    </aside>
  )
}
