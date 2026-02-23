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
    const apiKey = process.env['ANTHROPIC_API_KEY']

    if (!apiKey || apiKey === 'your_key_here') {
      return {
        error:
          'No valid API key configured. Set ANTHROPIC_API_KEY to enable chat.',
      }
    }

    const systemPrompt = `You are a Magic: The Gathering EDH/Commander deck building assistant. You have deep knowledge of card synergies, combo lines, mana curve optimization, and format legality. Be concise, helpful, and specific to the deck provided.

The user's current deck:
${params.deckContext}`

    const conversationMessages = params.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: conversationMessages,
        }),
      })

      if (!res.ok) {
        let errBody: { error?: { message?: string } } = {}
        try {
          errBody = (await res.json()) as { error?: { message?: string } }
        } catch {
          // ignore
        }

        if (res.status === 401) {
          return { error: 'Invalid API key. Check ANTHROPIC_API_KEY.' }
        }
        if (res.status === 429) {
          return {
            error:
              'Rate limited by Anthropic API. Please wait a moment and try again.',
          }
        }
        return {
          error: `API error ${res.status}: ${errBody?.error?.message ?? res.statusText}`,
        }
      }

      const data = (await res.json()) as {
        content?: Array<{ type: string; text: string }>
        error?: { message: string }
      }

      const text = data.content?.find((b) => b.type === 'text')?.text ?? ''
      return { content: text }
    } catch (err) {
      console.error('Chat server error:', err)
      return {
        error: 'Failed to reach Anthropic API. Check your network connection.',
      }
    }
  }
)
