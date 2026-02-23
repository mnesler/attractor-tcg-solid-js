/**
 * ShimmerCard: A shimmer placeholder matching MTG card aspect ratio (63:88 ≈ 0.716).
 * Displayed while a real card image is loading.
 */
export default function ShimmerCard() {
  return (
    <div
      class="shimmer-card shimmer"
      style={{
        'aspect-ratio': '63 / 88',
        'border-radius': '12px',
        width: '100%',
        display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
