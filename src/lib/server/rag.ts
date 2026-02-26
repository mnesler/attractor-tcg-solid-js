// Minimal RAG layer: parse the raw deck context string and produce a
// structured analysis summary that is injected into the system prompt.

export interface DeckAnalysis {
  totalCards: number
  commanderColors: string[]
  avgCmc: number
  manaCurve: Record<number, number> // cmc bucket → card count
  summary: string
}

// Matches lines like:  "1 Sol Ring"  or  "4 Lightning Bolt"
const CARD_LINE_RE = /^\s*(\d+)\s+(.+?)\s*$/

// Matches a mana-cost string such as "{2}{G}{W}" and counts coloured pips
const COLOUR_PIP_RE = /\{([WUBRGC])\}/g

// Very small static CMC map for the most common named cards so we can
// estimate avg CMC even when Scryfall data is not available in the context.
// The context string itself may contain cmc hints — we do our best.
const KNOWN_CMC: Record<string, number> = {
  'sol ring': 1,
  'arcane signet': 2,
  'command tower': 0,
  'swords to plowshares': 1,
  'counterspell': 2,
  'brainstorm': 1,
  "cultivate": 3,
  'kodama\'s reach': 3,
  'cyclonic rift': 2,
  'rhystic study': 3,
  'smothering tithe': 4,
  'mystic remora': 1,
}

function extractCmcFromLine(name: string): number | null {
  // Try a suffix like "(cmc:3)" that might appear in decorated context strings
  const hint = name.match(/\(cmc:(\d+(?:\.\d+)?)\)/i)
  if (hint) return parseFloat(hint[1])

  const key = name.toLowerCase().replace(/\s*\(.*\)/, '').trim()
  return KNOWN_CMC[key] ?? null
}

// Parse colour identity from a string like "Color Identity: W,U,B"
function parseColourIdentity(context: string): string[] {
  const match = context.match(/color\s+identity[:\s]+([WUBRG,\s]+)/i)
  if (!match) return []
  return match[1]
    .split(/[,\s]+/)
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[WUBRG]$/.test(c))
}

// Parse commander name from a header like "Commander: Atraxa, Praetors' Voice"
function parseCommanderName(context: string): string {
  const match = context.match(/commander[:\s]+([^\n]+)/i)
  return match ? match[1].trim() : ''
}

export function analyzeDeck(deckContext: string): DeckAnalysis {
  const lines = deckContext.split('\n')

  let totalCards = 0
  const cmcValues: number[] = []
  const manaCurve: Record<number, number> = {}

  for (const line of lines) {
    const m = line.match(CARD_LINE_RE)
    if (!m) continue

    const qty = parseInt(m[1], 10)
    const cardName = m[2].trim()
    if (!qty || !cardName) continue

    totalCards += qty

    const cmc = extractCmcFromLine(cardName)
    if (cmc !== null) {
      const bucket = Math.min(Math.round(cmc), 7) // cap at 7+
      for (let i = 0; i < qty; i++) cmcValues.push(cmc)
      manaCurve[bucket] = (manaCurve[bucket] ?? 0) + qty
    }
  }

  const commanderColors = parseColourIdentity(deckContext)
  const commanderName = parseCommanderName(deckContext)

  const avgCmc =
    cmcValues.length > 0
      ? Math.round((cmcValues.reduce((a, b) => a + b, 0) / cmcValues.length) * 100) / 100
      : 0

  // Build a concise natural-language summary
  const curveEntries = Object.entries(manaCurve)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([cmc, count]) => `${cmc === '7' ? '7+' : cmc}-drop: ${count}`)
    .join(', ')

  const colorStr =
    commanderColors.length > 0 ? commanderColors.join('') : 'unknown'

  const lines2: string[] = [
    `Total cards: ${totalCards}`,
    commanderName ? `Commander: ${commanderName}` : null,
    `Color identity: ${colorStr}`,
    avgCmc > 0 ? `Average CMC: ${avgCmc}` : null,
    curveEntries ? `Mana curve — ${curveEntries}` : null,
  ].filter(Boolean) as string[]

  return {
    totalCards,
    commanderColors,
    avgCmc,
    manaCurve,
    summary: lines2.join('\n'),
  }
}
