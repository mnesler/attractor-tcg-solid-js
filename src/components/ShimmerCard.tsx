/**
 * ShimmerCard: A shimmer placeholder matching MTG card aspect ratio (63:88 ≈ 0.716).
 * Displayed while a real card image is loading.
 */
export default function ShimmerCard() {
  return (
    <div
      class="shimmer-card-wrapper"
      style={{
        position: 'relative',
        width: '100%',
      }}
      aria-hidden="true"
    >
      <div
        class="shimmer-card shimmer"
        style={{
          'aspect-ratio': '63 / 88',
          'border-radius': '12px',
          width: '100%',
          display: 'block',
        }}
      />
      <div
        class="shimmer-card-glow"
        style={{
          position: 'absolute',
          inset: '-2px',
          'border-radius': '14px',
          background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(0,245,255,0.15), rgba(191,95,255,0.15))',
          'z-index': '-1',
          'pointer-events': 'none',
          animation: 'shimmer-glow 3s ease-in-out infinite',
        }}
      />
    </div>
  )
}
