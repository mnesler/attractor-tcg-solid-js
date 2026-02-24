import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import {
  createResource,
  Show,
  For,
  createSignal,
  createEffect,
  onCleanup,
  createMemo,
} from 'solid-js'
import { fetchMoxfieldDeck, moxfieldToDeckCards } from '~/lib/server/moxfield'
import { fetchScryfallCards } from '~/lib/server/scryfall'
import { parseDecklist, buildDeckContext } from '~/lib/deck-parser'
import DeckStats from '~/components/DeckStats'
import DeckSection from '~/components/DeckSection'
import Chat from '~/components/Chat'
import ShimmerCard from '~/components/ShimmerCard'
import type { DeckCard, ScryfallCard, CardType } from '~/lib/types'
import { CARD_TYPE_ORDER, getCardType } from '~/lib/types'

// Minimum time to show each loading stage (in ms)
const MIN_LOADING_TIME = 500

export const Route = createFileRoute('/deck/$deckId')({
  component: DeckPage,
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function enrichCards(
  cards: DeckCard[],
  scryfallData: ScryfallCard[]
): DeckCard[] {
  const byName = new Map<string, ScryfallCard>()
  for (const sc of scryfallData) {
    byName.set(sc.name.toLowerCase(), sc)
  }
  return cards.map((card) => ({
    ...card,
    scryfallCard: byName.get(card.name.toLowerCase()),
  }))
}

function groupByType(
  cards: DeckCard[],
  commanderNames: Set<string>
): Record<CardType, DeckCard[]> {
  const groups: Record<CardType, DeckCard[]> = {
    Commander: [],
    Creature: [],
    Instant: [],
    Sorcery: [],
    Artifact: [],
    Enchantment: [],
    Planeswalker: [],
    Land: [],
    Other: [],
  }
  for (const card of cards) {
    const isCommander = commanderNames.has(card.name)
    const type = getCardType(card, isCommander)
    groups[type].push(card)
  }
  return groups
}

// ── Particle Background ───────────────────────────────────────────────────────

function ParticleBackground() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
    color: ['#FF2D78', '#00F5FF', '#BF5FFF'][Math.floor(Math.random() * 3)],
  }))

  return (
    <div class="particle-background" aria-hidden="true">
      <For each={particles}>
        {(particle) => (
          <div
            class="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              'background-color': particle.color,
              'animation-delay': `${particle.delay}s`,
              'animation-duration': `${particle.duration}s`,
            }}
          />
        )}
      </For>
    </div>
  )
}

// ── Neon Loading Spinner ─────────────────────────────────────────────────────

function NeonSpinner() {
  return (
    <div class="neon-spinner-container">
      <div class="neon-spinner-ring">
        <div class="neon-spinner-orb" />
        <div class="neon-spinner-orb" />
        <div class="neon-spinner-orb" />
      </div>
      <div class="neon-spinner-core">
        <span class="neon-core-glyph">✦</span>
      </div>
      <svg class="neon-spinner-trails" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FF2D78" stop-opacity="0" />
            <stop offset="50%" stop-color="#00F5FF" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#BF5FFF" stop-opacity="0" />
          </linearGradient>
        </defs>
        <circle class="neon-trail" cx="50" cy="50" r="42" fill="none" stroke="url(#trail-gradient)" stroke-width="2" stroke-linecap="round" />
        <circle class="neon-trail neon-trail-delayed" cx="50" cy="50" r="42" fill="none" stroke="url(#trail-gradient)" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  )
}

// ── Progress Steps ────────────────────────────────────────────────────────────

interface LoadingStep {
  label: string
  status: 'pending' | 'active' | 'complete'
}

function LoadingProgress(props: { steps: LoadingStep[] }) {
  return (
    <div class="loading-progress">
      <For each={props.steps}>
        {(step, index) => (
          <div
            class="progress-step"
            classList={{
              'step-pending': step.status === 'pending',
              'step-active': step.status === 'active',
              'step-complete': step.status === 'complete',
            }}
          >
            <div class="step-indicator">
              <Show
                when={step.status === 'complete'}
                fallback={
                  <span class="step-number">{index() + 1}</span>
                }
              >
                <span class="step-check">✓</span>
              </Show>
            </div>
            <span class="step-label">{step.label}</span>
            <Show when={index() < props.steps.length - 1}>
              <div
                class="step-connector"
                classList={{ 'connector-complete': step.status === 'complete' }}
              />
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}

// ── Animated Loading Text ─────────────────────────────────────────────────────

function AnimatedLoadingText() {
  const messages = [
    'Summoning cards from the aether...',
    'Consulting Scryfall archives...',
    'Channeling mana...',
    'Brewing your deck...',
    'Fetching card images...',
  ]
  const [currentIndex, setCurrentIndex] = createSignal(0)
  const [isVisible, setIsVisible] = createSignal(true)

  createEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length)
        setIsVisible(true)
      }, 300)
    }, 2500)
    onCleanup(() => clearInterval(interval))
  })

  return (
    <div class="animated-loading-text" classList={{ 'text-visible': isVisible() }}>
      {messages[currentIndex()]}
    </div>
  )
}

// ── Card Skeleton Grid ────────────────────────────────────────────────────────

function CardSkeletonGrid() {
  const placeholders = Array.from({ length: 24 }, (_, i) => i)
  return (
    <div class="skeleton-grid-container">
      <div class="skeleton-section-header">
        <div class="skeleton-title shimmer" />
        <div class="skeleton-count shimmer" />
      </div>
      <div class="loading-shimmer-grid">
        <For each={placeholders}>
          {(_, i) => (
            <div
              class="skeleton-card-wrapper"
              style={{ 'animation-delay': `${i() * 30}ms` }}
            >
              <ShimmerCard />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

// ── Main Loading Screen ───────────────────────────────────────────────────────

function DeckLoadingScreen(props: {
  stage: 'deck' | 'scryfall'
  cardCount?: number
  deckName?: string
}) {
  const steps = (): LoadingStep[] => [
    {
      label: 'Load Deck',
      status: props.stage === 'deck' ? 'active' : 'complete',
    },
    {
      label: 'Fetch Cards',
      status: props.stage === 'deck' ? 'pending' : 'active',
    },
  ]

  return (
    <div class="deck-loading-screen">
      <ParticleBackground />
      <div class="loading-content">
        <NeonSpinner />
        <Show when={props.deckName}>
          <div class="loading-deck-name">{props.deckName}</div>
        </Show>
        <LoadingProgress steps={steps()} />
        <AnimatedLoadingText />
        <Show when={props.cardCount && props.cardCount > 0}>
          <div class="loading-stats">
            <span class="loading-stat-value">{props.cardCount}</span>
            <span class="loading-stat-label">cards to load</span>
          </div>
        </Show>
      </div>
      <CardSkeletonGrid />
    </div>
  )
}

// ── Server function wrappers ─────────────────────────────────────────────────
// The createServerFn builder without .inputValidator() types data as undefined,
// so we cast at the call site to keep TS happy while passing data at runtime.

type AnyServerFnCall = (opts?: { data?: unknown }) => Promise<unknown>

async function callMoxfieldFetch(deckId: string) {
  return (fetchMoxfieldDeck as AnyServerFnCall)({ data: deckId }) as ReturnType<
    typeof fetchMoxfieldDeck
  >
}

async function callScryfallFetch(names: string[]) {
  return (fetchScryfallCards as AnyServerFnCall)({ data: names }) as ReturnType<
    typeof fetchScryfallCards
  >
}

// ── Deck Fetcher ─────────────────────────────────────────────────────────────

interface DeckData {
  name: string
  commanders: DeckCard[]
  mainboard: DeckCard[]
}

async function loadDeckData(deckId: string): Promise<DeckData> {
  if (deckId.startsWith('mox_')) {
    const moxId = deckId.slice(4)
    const data = await callMoxfieldFetch(moxId)
    const { commanders, mainboard } = moxfieldToDeckCards(data)
    return {
      name: data.name ?? 'Moxfield Deck',
      commanders,
      mainboard,
    }
  }

  if (deckId.startsWith('local_')) {
    const storageKey = `deck_text_${deckId.slice(6)}`
    let text = ''
    if (typeof window !== 'undefined') {
      text = sessionStorage.getItem(storageKey) ?? ''
    }
    if (!text) {
      throw new Error(
        'Deck data not found in session. Please import your deck again.'
      )
    }
    const cards = parseDecklist(text)
    return {
      name: 'My EDH Deck',
      commanders: [],
      mainboard: cards,
    }
  }

  throw new Error(`Unknown deck ID format: ${deckId}`)
}

async function loadScryfallData(cards: DeckCard[]): Promise<ScryfallCard[]> {
  const names = [...new Set(cards.map((c) => c.name))]
  if (names.length === 0) return []
  return callScryfallFetch(names)
}

// ── Minimum Display Time Hook ─────────────────────────────────────────────────

function useMinDisplayTime(isLoading: () => boolean, minTime = MIN_LOADING_TIME) {
  const [startTime, setStartTime] = createSignal<number | null>(null)
  const [canShow, setCanShow] = createSignal(false)

  createEffect(() => {
    if (isLoading()) {
      setStartTime(Date.now())
      setCanShow(false)
      const timer = setTimeout(() => {
        setCanShow(true)
      }, minTime)
      onCleanup(() => clearTimeout(timer))
    } else {
      // When loading finishes, check if minimum time has passed
      const start = startTime()
      if (start === null) {
        setCanShow(true)
        return
      }
      const elapsed = Date.now() - start
      const remaining = Math.max(0, minTime - elapsed)
      
      if (remaining === 0) {
        setCanShow(true)
      } else {
        const timer = setTimeout(() => {
          setCanShow(true)
        }, remaining)
        onCleanup(() => clearTimeout(timer))
      }
    }
  })

  return createMemo(() => {
    // Show loading if still loading OR if minimum display time hasn't passed
    return isLoading() || !canShow()
  })
}

// ── Main Page Component ───────────────────────────────────────────────────────

function DeckPage() {
  const params = Route.useParams()
  const navigate = useNavigate()

  const deckId = () => params().deckId

  const [deckData] = createResource(deckId, loadDeckData)

  const allRawCards = () => {
    const d = deckData()
    if (!d) return null
    return [...d.commanders, ...d.mainboard]
  }

  const [scryfallData] = createResource(
    () => allRawCards(),
    (cards) => loadScryfallData(cards)
  )

  // Use minimum display time hooks for each loading stage
  const showDeckLoading = useMinDisplayTime(() => deckData.loading)
  const showScryfallLoading = useMinDisplayTime(() => scryfallData.loading)

  const enrichedCommanders = () => {
    const d = deckData()
    const sc = scryfallData()
    if (!d) return []
    return enrichCards(d.commanders, sc ?? [])
  }

  const enrichedMainboard = () => {
    const d = deckData()
    const sc = scryfallData()
    if (!d) return []
    return enrichCards(d.mainboard, sc ?? [])
  }

  const commanderNames = () =>
    new Set(enrichedCommanders().map((c) => c.name))

  const allEnrichedCards = () => [
    ...enrichedCommanders(),
    ...enrichedMainboard(),
  ]

  const groupedCards = () => groupByType(allEnrichedCards(), commanderNames())

  const deckContext = () => {
    const d = deckData()
    if (!d) return ''
    return buildDeckContext(
      d.name,
      enrichedCommanders().map((c) => c.name),
      allEnrichedCards()
    )
  }

  const loadingStage = () => {
    if (showDeckLoading()) return 'deck' as const
    if (showScryfallLoading()) return 'scryfall' as const
    return null
  }

  const cardCountToLoad = () => {
    const cards = allRawCards()
    return cards ? cards.length : 0
  }

  // Check if we should show any loading state (including minimum display time)
  const isLoading = () => showDeckLoading() || showScryfallLoading()

  // Check if there's an actual error (not just loading)
  const hasError = () => deckData.error && !deckData.loading

  return (
    <Show
      when={!isLoading() && !hasError()}
      fallback={
        <Show when={hasError()} fallback={
          <DeckLoadingScreen 
            stage={loadingStage() ?? 'deck'} 
            cardCount={cardCountToLoad()} 
            deckName={deckData()?.name}
          />
        }>
          <div class="error-page">
            <div class="error-icon">✦</div>
            <h1 class="error-title">Failed to load deck</h1>
            <p class="error-message">
              {String(deckData.error) || 'An unexpected error occurred.'}
            </p>
            <button
              class="btn-secondary"
              onClick={() => void navigate({ to: '/' })}
            >
              ← Back to Import
            </button>
          </div>
        </Show>
      }
    >
      <div class="deck-page">
        <div class="deck-main">
          <DeckStats
            deckName={deckData()?.name ?? ''}
            commanders={enrichedCommanders()}
            cards={enrichedMainboard()}
          />

          <Show
            when={!showScryfallLoading()}
            fallback={
              <DeckLoadingScreen stage="scryfall" cardCount={cardCountToLoad()} />
            }
          >
            <For each={CARD_TYPE_ORDER}>
              {(type) => (
                <DeckSection
                  type={type}
                  cards={groupedCards()[type] ?? []}
                  showQuantity
                />
              )}
            </For>
          </Show>
        </div>

        <Chat deckContext={deckContext()} />
      </div>
    </Show>
  )
}
