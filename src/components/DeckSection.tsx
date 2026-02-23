import { Show } from 'solid-js'
import CardGrid from './CardGrid'
import type { DeckCard, CardType } from '~/lib/types'

interface DeckSectionProps {
  type: CardType
  cards: DeckCard[]
  showQuantity?: boolean
}

const SECTION_ICONS: Record<string, string> = {
  Commander: '♛',
  Creature: '⚔',
  Instant: '⚡',
  Sorcery: '✦',
  Artifact: '⚙',
  Enchantment: '◈',
  Planeswalker: '★',
  Land: '◉',
  Other: '◆',
}

const SECTION_ACCENT: Record<string, string> = {
  Commander: 'var(--neon-pink)',
  Creature: 'var(--neon-cyan)',
  Instant: 'var(--neon-purple)',
  Sorcery: 'var(--neon-purple)',
  Artifact: 'var(--text-muted)',
  Enchantment: 'var(--neon-cyan)',
  Planeswalker: 'var(--neon-pink)',
  Land: '#7BC67A',
  Other: 'var(--text-muted)',
}

export default function DeckSection(props: DeckSectionProps) {
  const totalCards = () => props.cards.reduce((sum, c) => sum + c.quantity, 0)
  const icon = () => SECTION_ICONS[props.type] ?? '◆'
  const accent = () => SECTION_ACCENT[props.type] ?? 'var(--text-muted)'

  return (
    <Show when={props.cards.length > 0}>
      <section class="deck-section">
        <div class="deck-section-header" style={{ '--section-accent': accent() }}>
          <div class="deck-section-title">
            <span class="deck-section-icon" aria-hidden="true">
              {icon()}
            </span>
            <h2 class="deck-section-name">{props.type}</h2>
          </div>
          <span class="deck-section-count">{totalCards()}</span>
        </div>
        <div class="deck-section-divider" style={{ background: accent() }} />
        <CardGrid cards={props.cards} showQuantity={props.showQuantity ?? true} />
      </section>
    </Show>
  )
}
