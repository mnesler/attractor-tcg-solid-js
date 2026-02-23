import {
  createRoute,
  useParams,
  useNavigate,
} from '@tanstack/solid-router'
import {
  createResource,
  Show,
  For,
} from 'solid-js'
import { Route as RootRoute } from './__root'
import { fetchMoxfieldDeck, moxfieldToDeckCards } from '~/lib/server/moxfield'
import { fetchScryfallCards } from '~/lib/server/scryfall'
import { parseDecklist, buildDeckContext } from '~/lib/deck-parser'
import DeckStats from '~/components/DeckStats'
import DeckSection from '~/components/DeckSection'
import Chat from '~/components/Chat'
import ShimmerCard from '~/components/ShimmerCard'
import type { DeckCard, ScryfallCard, CardType } from '~/lib/types'
import { CARD_TYPE_ORDER, getCardType } from '~/lib/types'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/deck/$deckId',
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

// ── Shimmer Loading ───────────────────────────────────────────────────────────

function ShimmerDeckLoading() {
  const placeholders = Array.from({ length: 60 }, (_, i) => i)
  return (
    <div class="deck-page">
      <div class="deck-main">
        <div
          class="deck-stats shimmer"
          style={{
            height: '120px',
            'border-radius': '16px',
            'margin-bottom': '2rem',
          }}
        />
        <div class="deck-section">
          <div
            class="shimmer"
            style={{
              height: '28px',
              width: '150px',
              'border-radius': '8px',
              'margin-bottom': '1rem',
            }}
          />
          <div class="loading-shimmer-grid">
            <For each={placeholders}>{() => <ShimmerCard />}</For>
          </div>
        </div>
      </div>
      <div class="chat-sidebar" style={{ flex: '0 0 30%' }}>
        <div class="chat-header">
          <div
            class="shimmer"
            style={{ height: '20px', width: '120px', 'border-radius': '6px' }}
          />
        </div>
        <div class="chat-messages">
          <div class="shimmer" style={{ height: '60px', 'border-radius': '12px' }} />
          <div
            class="shimmer"
            style={{ height: '40px', 'border-radius': '12px', width: '70%', 'margin-left': 'auto' }}
          />
        </div>
      </div>
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

// ── Main Page Component ───────────────────────────────────────────────────────

function DeckPage() {
  // useParams returns an Accessor<{deckId: string}> in solid-router v1.16x
  const params = useParams({ from: '/deck/$deckId' })
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

  return (
    <Show
      when={!deckData.loading && !deckData.error}
      fallback={
        <Show when={deckData.error} fallback={<ShimmerDeckLoading />}>
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
            when={!scryfallData.loading}
            fallback={
              <div class="deck-section">
                <div
                  class="shimmer"
                  style={{ height: '28px', width: '180px', 'border-radius': '8px', 'margin-bottom': '1rem' }}
                />
                <div class="loading-shimmer-grid">
                  <For each={Array.from({ length: 40 }, (_, i) => i)}>
                    {() => <ShimmerCard />}
                  </For>
                </div>
              </div>
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
