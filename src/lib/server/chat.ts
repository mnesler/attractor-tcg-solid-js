import { createServerFn } from '@tanstack/solid-start'
import type { ChatMessage } from '../types'
import { callKimi } from './openrouter'
import { analyzeDeck } from './rag'

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

    // --- RAG: analyse the deck and inject a structured summary ---
    const deckAnalysis = analyzeDeck(params.deckContext)

    const systemPrompt = `You are a Magic: The Gathering EDH/Commander deck building assistant. You have deep knowledge of card synergies, combo lines, mana curve optimization, and format legality. Be concise, helpful, and specific to the deck provided.

Deck analysis summary:
${deckAnalysis.summary}

The user's current deck:
${params.deckContext}`

    // Build messages array: system prompt first, then conversation history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...params.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ]

    try {
      const text = await callKimi(messages, {
        model: 'moonshotai/kimi-k2.5',
        max_tokens: 1024,
      })
      return { content: text }
    } catch (err) {
      console.error('Chat server error:', err)
      return {
        error: err instanceof Error ? err.message : 'Failed to get a response from the AI.',
      }
    }
  }
)
