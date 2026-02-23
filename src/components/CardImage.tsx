import { createSignal, Show } from 'solid-js'
import ShimmerCard from './ShimmerCard'
import type { DeckCard } from '~/lib/types'

interface CardImageProps {
  card: DeckCard
  showQuantity?: boolean
}

export default function CardImage(props: CardImageProps) {
  const [loaded, setLoaded] = createSignal(false)
  const [errored, setErrored] = createSignal(false)

  const imgSrc = () => {
    const sc = props.card.scryfallCard
    if (!sc) return null
    // For double-faced cards, use the front face image
    return (
      sc.card_faces?.[0]?.image_uris?.normal ??
      sc.image_uris?.normal ??
      null
    )
  }

  const handleLoad = () => setLoaded(true)
  const handleError = () => {
    setLoaded(false)
    setErrored(true)
  }

  return (
    <div class="card-image-wrapper" title={props.card.name}>
      <Show when={!loaded() && !errored()}>
        <ShimmerCard />
      </Show>

      <Show when={imgSrc() !== null && !errored()}>
        <img
          src={imgSrc()!}
          alt={props.card.name}
          class="card-img"
          classList={{ loaded: loaded() }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </Show>

      <Show when={errored() || (!imgSrc() && !loaded())}>
        <div
          class="card-fallback"
          classList={{ shimmer: !props.card.scryfallCard }}
          style={{ 'aspect-ratio': '63 / 88' }}
        >
          <span class="card-fallback-name">{props.card.name}</span>
        </div>
      </Show>

      <Show when={props.showQuantity && (props.card.quantity ?? 1) > 1}>
        <span class="card-quantity">×{props.card.quantity}</span>
      </Show>
    </div>
  )
}
