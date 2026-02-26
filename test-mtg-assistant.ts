/**
 * Manual integration test for the MTG Assistant.
 *
 * Exercises the real pipeline:
 *   1. analyzeDeck()  — RAG layer that builds the system-prompt context
 *   2. callKimi()     — OpenRouter → Kimi k2.5 API call
 *
 * NOTE: sendChatMessage is a createServerFn and cannot be called from a plain
 * Node/tsx script.  We test the two underlying functions directly — this is
 * exactly what the server function composes when a real request arrives.
 *
 * Run with:
 *   cd /home/maxwell/attractor-tcg-solid-js
 *   npx tsx test-mtg-assistant.ts
 */

import { config } from 'node:process'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Load .env manually (no dotenv dependency required — just parse key=value)
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))

try {
  const envPath = resolve(__dirname, '.env')
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
} catch {
  // .env not found — rely on environment variables already being set
}

// ---------------------------------------------------------------------------
// Import the modules under test (they are plain TS, no server-fn magic here)
// ---------------------------------------------------------------------------
import { analyzeDeck } from './src/lib/server/rag.js'
import { callKimi } from './src/lib/server/openrouter.js'
import type { ChatMessage } from './src/lib/types.js'

// ---------------------------------------------------------------------------
// Mock deck — a compact Atraxa EDH shell
// ---------------------------------------------------------------------------
const mockDeckContext = `
Commander: Atraxa, Praetors' Voice
Color Identity: W,U,B,G

Mainboard:
1 Sol Ring
1 Command Tower
1 Arcane Signet
1 Swords to Plowshares
1 Counterspell
1 Brainstorm
1 Cultivate
1 Rhystic Study
1 Smothering Tithe
1 Mystic Remora
1 Evolving Wilds
1 Tundra
1 Underground Sea
1 Bayou
1 Tropical Island
1 Doubling Season
1 Proliferate Combo Piece
1 Astral Cornucopia
1 Darksteel Reactor
1 Contagion Engine
`.trim()

// ---------------------------------------------------------------------------
// Conversation to test
// ---------------------------------------------------------------------------
const userMessages: ChatMessage[] = [
  {
    role: 'user',
    content:
      "What do you think of this deck's mana base, and what are the top three cards I should add to improve it?",
  },
]

// ---------------------------------------------------------------------------
// Main test
// ---------------------------------------------------------------------------
async function runTest() {
  console.log('='.repeat(60))
  console.log('MTG Assistant — Integration Test')
  console.log('='.repeat(60))

  // --- Step 1: RAG layer ---
  console.log('\n[1/2] Running analyzeDeck() (RAG layer)...')
  const deckAnalysis = analyzeDeck(mockDeckContext)

  console.log('\nDeck Analysis Summary:')
  console.log('─'.repeat(40))
  console.log(deckAnalysis.summary)
  console.log('─'.repeat(40))
  console.log(`  totalCards : ${deckAnalysis.totalCards}`)
  console.log(`  avgCmc     : ${deckAnalysis.avgCmc}`)
  console.log(`  colors     : ${deckAnalysis.commanderColors.join(', ') || '(none detected)'}`)
  console.log(`  manaCurve  : ${JSON.stringify(deckAnalysis.manaCurve)}`)

  // --- Step 2: Build the same system prompt that chat.ts uses ---
  const systemPrompt = `You are a Magic: The Gathering EDH/Commander deck building assistant. You have deep knowledge of card synergies, combo lines, mana curve optimization, and format legality. Be concise, helpful, and specific to the deck provided.

Deck analysis summary:
${deckAnalysis.summary}

The user's current deck:
${mockDeckContext}`

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...userMessages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
  ]

  // --- Step 3: Call Kimi ---
  console.log('\n[2/2] Calling callKimi() via OpenRouter (moonshotai/kimi-k2.5)...')
  console.log(`  Model       : moonshotai/kimi-k2.5`)
  console.log(`  max_tokens  : 4096`)
  console.log(`  User prompt : "${userMessages[0].content}"`)
  console.log()

  const startMs = Date.now()

  try {
    const response = await callKimi(messages, {
      model: 'moonshotai/kimi-k2.5',
      max_tokens: 4096, // reasoning model needs budget for chain-of-thought + answer
      temperature: 0.7,
    })

    const elapsed = Date.now() - startMs

    console.log('='.repeat(60))
    console.log(`✅  SUCCESS  (${elapsed} ms)`)
    console.log('='.repeat(60))
    console.log('\nAssistant response:\n')
    console.log(response)
    console.log()
  } catch (err) {
    const elapsed = Date.now() - startMs
    console.error('='.repeat(60))
    console.error(`❌  FAILED  (${elapsed} ms)`)
    console.error('='.repeat(60))
    console.error('\nError:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

runTest().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
