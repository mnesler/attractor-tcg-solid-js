import { createServerFn } from '@tanstack/solid-start'
import type { ScryfallCard } from '../types'

const SCRYFALL_BASE_URL = 'https://api.scryfall.com'

const SCRYFALL_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// Fetch a batch of cards by exact name via POST /cards/collection.
// Handles pagination via chunk() to stay within the 75-identifier limit.
export const fetchScryfallCards = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const names = (ctx.data as unknown) as string[]
    const chunks = chunk(names, 75)
    const results: ScryfallCard[] = []

    for (const c of chunks) {
      // Respect Scryfall rate limit: 10 requests/sec
      if (results.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 120))
      }

      const res = await fetch(`${SCRYFALL_BASE_URL}/cards/collection`, {
        method: 'POST',
        headers: SCRYFALL_HEADERS,
        body: JSON.stringify({
          identifiers: c.map((name) => ({ name })),
        }),
      })

      if (!res.ok) {
        console.error(`Scryfall collection error: ${res.status}`)
        continue
      }

      const data = (await res.json()) as {
        data?: ScryfallCard[]
        not_found?: unknown[]
      }
      if (data.data) {
        results.push(...data.data)
      }
    }

    return results
  }
)

export interface SearchScryfallParams {
  // Scryfall full-text search query, e.g. "c:blue t:instant cmc<=2"
  query: string
  // Maximum number of results to return (default: 20, max: 175)
  limit?: number
}

// Search Scryfall using its full-text query syntax (GET /cards/search).
// Returns up to `limit` cards sorted by Scryfall's default relevance order.
// Returns an empty array when no cards match — never throws on a 404.
export const searchScryfall = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { query, limit = 20 } = (ctx.data as unknown) as SearchScryfallParams

    if (!query.trim()) return [] as ScryfallCard[]

    const url = new URL(`${SCRYFALL_BASE_URL}/cards/search`)
    url.searchParams.set('q', query.trim())
    url.searchParams.set('order', 'name')

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: SCRYFALL_HEADERS,
    })

    // 404 means no cards matched — treat as an empty result, not an error
    if (res.status === 404) return [] as ScryfallCard[]

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as {
        details?: string
      }
      throw new Error(
        `Scryfall search error ${res.status}: ${errBody.details ?? res.statusText}`,
      )
    }

    const data = (await res.json()) as {
      data?: ScryfallCard[]
      total_cards?: number
    }

    const cards = data.data ?? []
    return cards.slice(0, limit) as ScryfallCard[]
  }
)
