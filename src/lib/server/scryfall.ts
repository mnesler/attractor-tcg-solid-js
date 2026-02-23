import { createServerFn } from '@tanstack/solid-start'
import type { ScryfallCard } from '../types'

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

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

      const res = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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
