import { createServerFn } from '@tanstack/solid-start'
import type { ChatMessage } from '../types'

interface ChatParams {
  messages: ChatMessage[]
  deckContext: string
}

interface ChatResult {
  content?: string
  error?: string
}

export const sendChatMessage = createServerFn({ method: 'POST' }).handler(
  async (ctx): Promise<ChatResult> => {
    const params = (ctx.data as unknown) as ChatParams

    const systemPrompt = `You are a Magic: The Gathering EDH/Commander deck building assistant. You have deep knowledge of card synergies, combo lines, mana curve optimization, and format legality. Be concise, helpful, and specific to the deck provided.

The user's current deck:
${params.deckContext}`

    // Build messages array with system prompt first, followed by conversation history
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...params.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role,
          content: m.content,
        })),
    ]

    try {
      const res = await fetch(
        'http://localhost:12434/engines/llama.cpp/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'hf.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF:Q4_K_M',
            max_tokens: 1024,
            messages: messages,
          }),
        }
      )

      if (!res.ok) {
        let errBody: { error?: { message?: string } } = {}
        try {
          errBody = (await res.json()) as { error?: { message?: string } }
        } catch {
          // ignore
        }

        return {
          error: `Local model error ${res.status}: ${errBody?.error?.message ?? res.statusText}`,
        }
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>
        error?: { message: string }
      }

      const text = data.choices?.[0]?.message?.content ?? ''
      return { content: text }
    } catch (err) {
      console.error('Chat server error:', err)
      // Check for connection errors to the local model
      if (
        err instanceof Error &&
        (err.message.includes('fetch failed') ||
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('ENOTFOUND') ||
          err.message.includes('connect ECONNREFUSED'))
      ) {
        return {
          error:
            'Local MTG model is not running. Start it with: docker model run hf.co/minimaxir/magic-the-gathering',
        }
      }
      return {
        error: 'Failed to connect to local model. Check if Docker model runner is running.',
      }
    }
  }
)
