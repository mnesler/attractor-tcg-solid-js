const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'moonshotai/kimi-k2.5'
const DEFAULT_MAX_TOKENS = 4096
const DEFAULT_TEMPERATURE = 0.7

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterOptions {
  model?: string
  max_tokens?: number
  temperature?: number
}

export async function callKimi(
  messages: OpenRouterMessage[],
  options?: OpenRouterOptions,
): Promise<string> {
  const apiKey = process.env['OPENROUTER_API_KEY']
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment')
  }

  const model = options?.model ?? DEFAULT_MODEL
  const max_tokens = options?.max_tokens ?? DEFAULT_MAX_TOKENS
  const temperature = options?.temperature ?? DEFAULT_TEMPERATURE

  let res: Response
  try {
    res = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/strongdm/attractor',
        'X-Title': 'MTG Deck Building Assistant',
      },
      body: JSON.stringify({ model, max_tokens, temperature, messages }),
    })
  } catch (err) {
    throw new Error(
      `OpenRouter request failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  if (!res.ok) {
    let errBody: { error?: { message?: string } } = {}
    try {
      errBody = (await res.json()) as { error?: { message?: string } }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(
      `OpenRouter error ${res.status}: ${errBody?.error?.message ?? res.statusText}`,
    )
  }

  // Kimi k2.5 is a reasoning model: it may spend all of its token budget on
  // internal chain-of-thought stored in `message.reasoning` and emit an empty
  // `message.content` when max_tokens is too small.  If content is blank, fall
  // back to the reasoning text so the caller always gets something useful.
  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string
        reasoning?: string
      }
    }>
  }

  const msg = data.choices?.[0]?.message
  return msg?.content?.trim() || msg?.reasoning?.trim() || ''
}
