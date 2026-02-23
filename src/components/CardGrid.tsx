import { For } from 'solid-js'
import CardImage from './CardImage'
import type { DeckCard } from '~/lib/types'

interface CardGridProps {
  cards: DeckCard[]
  showQuantity?: boolean
}

export default function CardGrid(props: CardGridProps) {
  return (
    <div class="card-grid">
      <For each={props.cards}>
        {(card) => (
          <CardImage card={card} showQuantity={props.showQuantity ?? true} />
        )}
      </For>
    </div>
  )
}
