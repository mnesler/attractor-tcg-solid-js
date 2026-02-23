import { createServerFn } from '@tanstack/solid-start'
import type { DeckCard } from '../types'

interface MoxfieldCardEntry {
  quantity: number
  card: {
    name: string
    type: string
  }
}

interface MoxfieldBoard {
  count: number
  cards: Record<string, MoxfieldCardEntry>
}

export interface MoxfieldDeck {
  id: string
  name: string
  format: string
  boards: {
    commanders: MoxfieldBoard
    mainboard: MoxfieldBoard
    [key: string]: MoxfieldBoard
  }
}

export const fetchMoxfieldDeck = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    const deckId = (ctx.data as unknown) as string
    const res = await fetch(
      `https://api2.moxfield.com/v3/decks/all/${deckId}`,
      {
        headers: {
          'User-Agent': 'EDHBuilder/1.0',
          Accept: 'application/json',
        },
      }
    )
    if (!res.ok) {
      throw new Error(`Moxfield API error: ${res.status} ${res.statusText}`)
    }
    const data = (await res.json()) as MoxfieldDeck
    return data
  }
)

/**
 * Convert Moxfield deck response to our internal DeckCard[] format.
 */
export function moxfieldToDeckCards(data: MoxfieldDeck): {
  commanders: DeckCard[]
  mainboard: DeckCard[]
} {
  const commanders: DeckCard[] = Object.values(data.boards?.commanders?.cards ?? {}).map(
    (entry) => ({
      quantity: entry.quantity,
      name: entry.card.name,
    })
  )
  const mainboard: DeckCard[] = Object.values(data.boards?.mainboard?.cards ?? {}).map(
    (entry) => ({
      quantity: entry.quantity,
      name: entry.card.name,
    })
  )
  return { commanders, mainboard }
}
