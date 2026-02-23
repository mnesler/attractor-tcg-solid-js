import { For, Show } from 'solid-js'
import type { DeckCard } from '~/lib/types'

interface DeckStatsProps {
  cards: DeckCard[]
  commanders: DeckCard[]
  deckName: string
}

const COLOR_SYMBOLS: Record<string, { label: string; bg: string; text: string }> = {
  W: { label: 'White', bg: '#F9FAF4', text: '#1a1a1a' },
  U: { label: 'Blue', bg: '#0E68AB', text: '#ffffff' },
  B: { label: 'Black', bg: '#150B00', text: '#ffffff' },
  R: { label: 'Red', bg: '#D3202A', text: '#ffffff' },
  G: { label: 'Green', bg: '#00733E', text: '#ffffff' },
  C: { label: 'Colorless', bg: '#9D9D9D', text: '#ffffff' },
}

function getColorIdentity(cards: DeckCard[]): string[] {
  const colors = new Set<string>()
  for (const card of cards) {
    for (const c of card.scryfallCard?.color_identity ?? []) {
      colors.add(c)
    }
  }
  // Return in WUBRG order
  return ['W', 'U', 'B', 'R', 'G', 'C'].filter((c) => colors.has(c))
}

function getTypeCounts(cards: DeckCard[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const card of cards) {
    const tl = card.scryfallCard?.type_line ?? ''
    let type = 'Other'
    if (tl.includes('Creature')) type = 'Creatures'
    else if (tl.includes('Instant')) type = 'Instants'
    else if (tl.includes('Sorcery')) type = 'Sorceries'
    else if (tl.includes('Artifact')) type = 'Artifacts'
    else if (tl.includes('Enchantment')) type = 'Enchantments'
    else if (tl.includes('Planeswalker')) type = 'Planeswalkers'
    else if (tl.includes('Land')) type = 'Lands'
    counts[type] = (counts[type] ?? 0) + card.quantity
  }
  return counts
}

export default function DeckStats(props: DeckStatsProps) {
  const allCards = () => [...props.commanders, ...props.cards]
  const totalCards = () => allCards().reduce((sum, c) => sum + c.quantity, 0)
  const colorIdentity = () => getColorIdentity(allCards())
  const typeCounts = () => getTypeCounts(props.cards)
  const commanderNames = () => props.commanders.map((c) => c.name).join(' + ')

  return (
    <div class="deck-stats">
      <div class="deck-stats-header">
        <div class="deck-meta">
          <h1 class="deck-name">{props.deckName}</h1>
          <Show when={commanderNames()}>
            <p class="commander-label">
              <span class="commander-icon">♛</span> {commanderNames()}
            </p>
          </Show>
        </div>
        <div class="deck-stats-right">
          <div class="color-pips">
            <For each={colorIdentity()}>
              {(color) => {
                const sym = COLOR_SYMBOLS[color]
                return (
                  <span
                    class="color-pip"
                    style={{
                      background: sym?.bg ?? '#888',
                      color: sym?.text ?? '#fff',
                    }}
                    title={sym?.label ?? color}
                    aria-label={sym?.label ?? color}
                  >
                    {color}
                  </span>
                )
              }}
            </For>
          </div>
          <div class="total-count">
            <span class="total-count-number">{totalCards()}</span>
            <span class="total-count-label">cards</span>
          </div>
        </div>
      </div>
      <div class="type-breakdown">
        <For each={Object.entries(typeCounts())}>
          {([type, count]) => (
            <div class="type-pill">
              <span class="type-pill-count">{count}</span>
              <span class="type-pill-label">{type}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
