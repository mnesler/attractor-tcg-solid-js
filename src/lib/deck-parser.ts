import type { DeckCard } from './types'

/**
 * Parse a plain-text decklist into DeckCard[].
 * Supports formats:
 *   "1 Sol Ring"
 *   "4x Lightning Bolt"
 *   "1x Command Tower"
 * Lines starting with //, #, or blank lines are skipped.
 * Lines starting with "SB:" (sideboard) are also skipped.
 */
export function parseDecklist(text: string): DeckCard[] {
  const cards: DeckCard[] = []
  const seen = new Map<string, DeckCard>()

  const lines = text.split('\n')
  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Skip blank lines and comments
    if (!line) continue
    if (line.startsWith('//') || line.startsWith('#')) continue
    if (line.startsWith('SB:')) continue

    // Match quantity and card name
    // Supports: "1 Sol Ring", "4x Lightning Bolt", "1x Sol Ring", "4 Lightning Bolt"
    const match = line.match(/^(\d+)x?\s+(.+)$/i)
    if (!match) {
      // Try matching just a card name with no quantity (assume 1)
      const nameOnly = line.match(/^([A-Za-z].+)$/)
      if (nameOnly) {
        const name = normalizeCardName(nameOnly[1].trim())
        if (!name) continue
        const existing = seen.get(name)
        if (existing) {
          existing.quantity += 1
        } else {
          const card: DeckCard = { quantity: 1, name }
          seen.set(name, card)
          cards.push(card)
        }
      }
      continue
    }

    const quantity = parseInt(match[1], 10)
    const name = normalizeCardName(match[2].trim())
    if (!name || quantity < 1) continue

    // Deduplicate by name
    const existing = seen.get(name)
    if (existing) {
      existing.quantity += quantity
    } else {
      const card: DeckCard = { quantity, name }
      seen.set(name, card)
      cards.push(card)
    }
  }

  return cards
}

/**
 * Normalize a card name: strip trailing set/collector annotations like "(M21) 1"
 */
function normalizeCardName(name: string): string {
  // Strip trailing "(SET) collector#" annotations from some export formats
  return name.replace(/\s*\([A-Z0-9]{2,6}\)\s*\d*\s*$/, '').trim()
}

/**
 * Extract a Moxfield deck ID from a URL or return the raw ID.
 * Handles:
 *   https://www.moxfield.com/decks/AbCdEf123
 *   AbCdEf123
 */
export function extractMoxfieldId(input: string): string | null {
  const trimmed = input.trim()
  // Full URL
  const urlMatch = trimmed.match(/moxfield\.com\/decks\/([A-Za-z0-9_-]+)/)
  if (urlMatch) return urlMatch[1]
  // Raw ID (alphanumeric + dashes/underscores, reasonable length)
  if (/^[A-Za-z0-9_-]{4,64}$/.test(trimmed)) return trimmed
  return null
}

/**
 * Build a deck context string for the AI chat.
 */
export function buildDeckContext(
  deckName: string,
  commander: string[],
  cards: DeckCard[]
): string {
  const lines: string[] = []
  lines.push(`Deck: ${deckName}`)
  if (commander.length > 0) {
    lines.push(`Commander(s): ${commander.join(', ')}`)
  }
  lines.push(`Total cards: ${cards.reduce((sum, c) => sum + c.quantity, 0)}`)
  lines.push('')
  lines.push('Card list:')
  for (const card of cards) {
    lines.push(`  ${card.quantity}x ${card.name}`)
  }
  return lines.join('\n')
}
