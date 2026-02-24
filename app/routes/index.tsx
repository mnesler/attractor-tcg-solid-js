import { createFileRoute, useNavigate, Link } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'
import { parseDecklist, extractMoxfieldId } from '~/lib/deck-parser'

export const Route = createFileRoute('/')({
  component: ImportPage,
})

function ImportPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = createSignal<'paste' | 'moxfield'>('paste')
  const [deckText, setDeckText] = createSignal('')
  const [moxfieldUrl, setMoxfieldUrl] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handlePasteSubmit = async () => {
    const text = deckText().trim()
    if (!text) {
      setError('Please paste a decklist first.')
      return
    }
    const cards = parseDecklist(text)
    if (cards.length === 0) {
      setError('No cards found. Make sure each line is like "1 Sol Ring".')
      return
    }
    setError('')
    setLoading(true)

    const timestamp = Date.now()
    const storageKey = `deck_text_${timestamp}`
    try {
      sessionStorage.setItem(storageKey, text)
    } catch (_e) {
      // sessionStorage might not be available in SSR; that's fine
    }

    const deckId = `local_${timestamp}`
    // Artificial delay to show loading animation
    await new Promise(resolve => setTimeout(resolve, 500))
    await navigate({ to: '/deck/$deckId', params: { deckId } })
    setLoading(false)
  }

  const handleMoxfieldSubmit = async () => {
    const url = moxfieldUrl().trim()
    if (!url) {
      setError('Please enter a Moxfield URL or deck ID.')
      return
    }
    const deckId = extractMoxfieldId(url)
    if (!deckId) {
      setError('Could not parse a Moxfield deck ID from that URL. Try: https://www.moxfield.com/decks/YOUR_DECK_ID')
      return
    }
    setError('')
    setLoading(true)
    // Artificial delay to show loading animation
    await new Promise(resolve => setTimeout(resolve, 500))
    await navigate({
      to: '/deck/$deckId',
      params: { deckId: `mox_${deckId}` },
    })
    setLoading(false)
  }

  const handleKeyDown = (e: KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      fn()
    }
  }

  return (
    <div class="import-page">
      <div class="import-hero">
        <h1 class="import-hero-title">EDH Deck Builder</h1>
        <p class="import-hero-subtitle">
          Import your Commander deck from Moxfield or paste a decklist — get card images, stats, and AI deck advice.
        </p>
      </div>

      <div class="import-card">
        <div class="tab-bar" role="tablist">
          <button
            role="tab"
            class="tab-btn"
            classList={{ active: activeTab() === 'paste' }}
            onClick={() => { setActiveTab('paste'); setError('') }}
            aria-selected={activeTab() === 'paste'}
          >
            ✦ Paste Decklist
          </button>
          <button
            role="tab"
            class="tab-btn"
            classList={{ active: activeTab() === 'moxfield' }}
            onClick={() => { setActiveTab('moxfield'); setError('') }}
            aria-selected={activeTab() === 'moxfield'}
          >
            ◈ Moxfield URL
          </button>
        </div>

        <div class="tab-content">
          {activeTab() === 'paste' ? (
            <div role="tabpanel">
              <div class="form-group">
                <label class="form-label" for="deck-textarea">
                  Decklist
                </label>
                <textarea
                  id="deck-textarea"
                  class="form-textarea"
                  placeholder={`1 Sol Ring\n1 Command Tower\n1 Rhystic Study\n// Comments are ignored\n1 Cyclonic Rift\n...`}
                  value={deckText()}
                  onInput={(e) => setDeckText(e.currentTarget.value)}
                  onKeyDown={(e) => handleKeyDown(e, handlePasteSubmit)}
                  spellcheck={false}
                  autocomplete="off"
                />
                <p class="form-hint">
                  One card per line: "1 Sol Ring". Ctrl+Enter to submit.
                </p>
              </div>
              {error() && <div class="import-error">{error()}</div>}
              <button
                class="btn-primary"
                onClick={handlePasteSubmit}
                disabled={loading()}
              >
                {loading() ? 'Loading...' : 'View Deck →'}
              </button>
            </div>
          ) : (
            <div role="tabpanel">
              <div class="form-group">
                <label class="form-label" for="moxfield-input">
                  Moxfield Deck URL
                </label>
                <input
                  id="moxfield-input"
                  type="url"
                  class="form-input"
                  placeholder="https://www.moxfield.com/decks/AbCdEf123"
                  value={moxfieldUrl()}
                  onInput={(e) => setMoxfieldUrl(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleMoxfieldSubmit()
                  }}
                  autocomplete="off"
                />
                <p class="form-hint">
                  Paste a full Moxfield URL or just the deck ID. Your deck is
                  fetched server-side to avoid CORS.
                </p>
              </div>
              {error() && <div class="import-error">{error()}</div>}
              <button
                class="btn-primary"
                onClick={handleMoxfieldSubmit}
                disabled={loading()}
              >
                {loading() ? 'Fetching...' : 'Import from Moxfield →'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div class="import-features">
        <div class="feature-pill">
          <span class="feature-icon">⚡</span> Scryfall card images
        </div>
        <div class="feature-pill">
          <span class="feature-icon">◈</span> AI deck assistant
        </div>
        <div class="feature-pill">
          <span class="feature-icon">✦</span> Color identity stats
        </div>
        <div class="feature-pill">
          <span class="feature-icon">◉</span> Organized by type
        </div>
      </div>

      <div class="history-link-wrapper">
        <Link to="/history" class="history-link">
          <span class="history-link-icon">◉</span>
          <span>View Pipeline History</span>
        </Link>
      </div>

      <style>{`
        .import-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 2.5rem;
        }
        .feature-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 1rem;
          background: rgba(255, 45, 120, 0.08);
          border: 1px solid rgba(255, 45, 120, 0.2);
          border-radius: 999px;
          font-size: 0.85rem;
          color: var(--text-muted);
          transition: 0.2s ease;
        }
        .feature-pill:hover {
          color: var(--neon-pink);
          border-color: var(--neon-pink);
          box-shadow: 0 0 12px rgba(255, 45, 120, 0.3);
        }
        .feature-icon {
          color: var(--neon-pink);
        }

        .history-link-wrapper {
          margin-top: 1.5rem;
        }

        .history-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(0, 245, 255, 0.08);
          border: 1px solid rgba(0, 245, 255, 0.2);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition);
          text-decoration: none;
        }

        .history-link:hover {
          color: var(--neon-cyan);
          border-color: var(--neon-cyan);
          box-shadow: 0 0 12px rgba(0, 245, 255, 0.3);
          transform: translateY(-1px);
        }

        .history-link-icon {
          color: var(--neon-cyan);
        }
      `}</style>
    </div>
  )
}
