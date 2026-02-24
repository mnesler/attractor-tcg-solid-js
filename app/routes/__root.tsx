import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/solid-router'
import { HydrationScript } from 'solid-js/web'
import NavBar from '~/components/NavBar'

export const Route = createRootRoute({
  component: () => (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>EDH Builder</title>
        <HydrationScript />
        <HeadContent />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{GLOBAL_CSS}</style>
      </head>
      <body>
        <NavBar />
        <main class="main-content">
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  ),
})

const GLOBAL_CSS = `
/* =============================================
   RESET
   ============================================= */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* =============================================
   CSS VARIABLES — Miami Vice palette
   ============================================= */
:root {
  --bg-deep:      #0D0D1A;
  --bg-card:      #12122A;
  --bg-elevated:  #1A1A38;
  --bg-input:     #0F0F24;
  --neon-pink:    #FF2D78;
  --neon-cyan:    #00F5FF;
  --neon-purple:  #BF5FFF;
  --neon-green:   #39FF14;
  --text-primary: #F0F0FF;
  --text-muted:   #8888BB;
  --border-dim:   rgba(255, 45, 120, 0.2);
  --border-cyan:  rgba(0, 245, 255, 0.25);
  --glow-pink:    0 0 15px rgba(255, 45, 120, 0.6), 0 0 30px rgba(255, 45, 120, 0.3);
  --glow-cyan:    0 0 15px rgba(0, 245, 255, 0.6), 0 0 30px rgba(0, 245, 255, 0.3);
  --glow-purple:  0 0 15px rgba(191, 95, 255, 0.6);
  --transition:   0.2s ease;
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    16px;
}

/* =============================================
   BASE STYLES
   ============================================= */
html, body {
  height: 100%;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--bg-deep);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
}

input, textarea {
  font-family: inherit;
}

/* =============================================
   SHIMMER ANIMATION
   ============================================= */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes shimmer-glow {
  0%, 100% {
    opacity: 0.3;
    filter: blur(8px);
  }
  50% {
    opacity: 0.6;
    filter: blur(12px);
  }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%           { transform: translateY(-8px); opacity: 1; }
}

@keyframes slide-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.shimmer {
  background: linear-gradient(90deg, #1A1A35 25%, #2D2D55 50%, #1A1A35 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.shimmer-card {
  display: block;
  width: 100%;
  border-radius: var(--radius-md);
  min-height: 60px;
}

/* =============================================
   LAYOUT
   ============================================= */
.main-content {
  min-height: calc(100vh - 60px);
}

/* =============================================
   NAVBAR
   ============================================= */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  background: rgba(13, 13, 26, 0.95);
  border-bottom: 1px solid var(--border-dim);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: var(--transition);
}

.navbar-brand:hover .brand-glyph,
.navbar-brand:hover .brand-text {
  text-shadow: var(--glow-pink);
}

.brand-glyph {
  font-size: 1.4rem;
  color: var(--neon-pink);
  text-shadow: var(--glow-pink);
  animation: pulse-glow 3s ease-in-out infinite;
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--neon-pink);
  letter-spacing: 0.05em;
  text-shadow: var(--glow-pink);
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  border: 1px solid transparent;
}

.nav-link:hover,
.nav-link.active {
  color: var(--neon-cyan);
  border-color: var(--border-cyan);
  box-shadow: var(--glow-cyan);
}

/* =============================================
   IMPORT PAGE — HERO
   ============================================= */
.import-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 4rem 2rem 2rem;
}

.import-hero {
  text-align: center;
  margin-bottom: 3rem;
}

.import-hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, var(--neon-pink), var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.import-hero-subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
  max-width: 480px;
  margin: 0 auto;
}

.import-card {
  width: 100%;
  max-width: 640px;
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
}

/* =============================================
   TABS
   ============================================= */
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--border-dim);
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: var(--transition);
  letter-spacing: 0.02em;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.tab-btn.active {
  color: var(--neon-cyan);
  border-bottom-color: var(--neon-cyan);
  box-shadow: inset 0 -2px 8px rgba(0, 245, 255, 0.2);
}

.tab-content {
  padding: 2rem;
}

/* =============================================
   FORM ELEMENTS
   ============================================= */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.6rem;
}

.form-textarea {
  width: 100%;
  min-height: 220px;
  padding: 1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  transition: var(--transition);
  outline: none;
}

.form-textarea:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.15), var(--glow-cyan);
}

.form-textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1.1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition);
  outline: none;
}

.form-input:focus {
  border-color: var(--neon-pink);
  box-shadow: 0 0 0 2px rgba(255, 45, 120, 0.15), var(--glow-pink);
}

.form-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.form-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* =============================================
   BUTTONS
   ============================================= */
.btn-primary {
  width: 100%;
  padding: 0.9rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--neon-pink), var(--neon-purple));
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: var(--transition);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:hover {
  box-shadow: var(--glow-pink);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.import-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 45, 120, 0.1);
  border: 1px solid rgba(255, 45, 120, 0.4);
  border-radius: var(--radius-sm);
  color: var(--neon-pink);
  font-size: 0.9rem;
}

/* =============================================
   DECK VIEW PAGE
   ============================================= */
.deck-page {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.deck-main {
  flex: 0 0 70%;
  overflow-y: auto;
  padding: 2rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border-dim) transparent;
}

.deck-main::-webkit-scrollbar {
  width: 6px;
}
.deck-main::-webkit-scrollbar-track {
  background: transparent;
}
.deck-main::-webkit-scrollbar-thumb {
  background: var(--border-dim);
  border-radius: 3px;
}

/* =============================================
   DECK STATS
   ============================================= */
.deck-stats {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.deck-stats-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.deck-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  background: linear-gradient(135deg, var(--text-primary), var(--text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.commander-label {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  color: var(--neon-pink);
  font-weight: 500;
}

.commander-icon {
  margin-right: 0.3rem;
}

.deck-stats-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

.color-pips {
  display: flex;
  gap: 0.4rem;
}

.color-pip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.2);
}

.total-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1;
}

.total-count-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--neon-cyan);
  text-shadow: var(--glow-cyan);
  line-height: 1;
}

.total-count-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.type-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.type-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.7rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  border-radius: 999px;
  font-size: 0.8rem;
}

.type-pill-count {
  color: var(--neon-cyan);
  font-weight: 700;
}

.type-pill-label {
  color: var(--text-muted);
}

/* =============================================
   DECK SECTION
   ============================================= */
.deck-section {
  margin-bottom: 2.5rem;
  animation: slide-in-up 0.3s ease forwards;
}

.deck-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.deck-section-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.deck-section-icon {
  font-size: 1.1rem;
  color: var(--section-accent, var(--text-muted));
}

.deck-section-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--section-accent, var(--text-primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.deck-section-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  border-radius: 999px;
  padding: 0.15rem 0.65rem;
}

.deck-section-divider {
  height: 1px;
  opacity: 0.4;
  border-radius: 1px;
  margin-bottom: 1rem;
}

/* =============================================
   CARD GRID
   ============================================= */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

/* =============================================
   CARD IMAGE
   ============================================= */
.card-image-wrapper {
  position: relative;
  border-radius: var(--radius-md);
  overflow: visible;
  transition: transform var(--transition);
}

.card-image-wrapper:hover {
  transform: translateY(-4px) scale(1.02);
  z-index: 10;
}

.card-img {
  display: none;
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: box-shadow var(--transition), border-color var(--transition);
  aspect-ratio: 63 / 88;
  object-fit: cover;
}

.card-img.loaded {
  display: block;
}

.card-image-wrapper:hover .card-img.loaded {
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.5), 0 8px 24px rgba(0,0,0,0.6);
  border-color: rgba(0, 245, 255, 0.5);
}

.card-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  padding: 0.75rem;
  text-align: center;
}

.card-fallback-name {
  font-size: 0.75rem;
  color: var(--text-muted);
  word-break: break-word;
  line-height: 1.3;
}

.card-quantity {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.85);
  color: var(--neon-cyan);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 245, 255, 0.4);
  backdrop-filter: blur(4px);
  text-shadow: 0 0 6px var(--neon-cyan);
}

/* =============================================
   CHAT SIDEBAR
   ============================================= */
.chat-sidebar {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-left: 1px solid var(--border-dim);
  height: 100%;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-dim);
  background: var(--bg-elevated);
  flex-shrink: 0;
}

.chat-icon {
  font-size: 1.2rem;
  color: var(--neon-purple);
  text-shadow: var(--glow-purple);
}

.chat-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border-dim) transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}
.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-dim);
  border-radius: 2px;
}

.chat-message {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  animation: slide-in-up 0.2s ease forwards;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.chat-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.assistant-avatar {
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
  color: #fff;
  box-shadow: var(--glow-purple);
}

.user-avatar {
  background: linear-gradient(135deg, var(--neon-cyan), #0099aa);
  color: #000;
  box-shadow: var(--glow-cyan);
}

.chat-bubble {
  max-width: 85%;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.55;
}

.chat-message.assistant .chat-bubble {
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  border-top-left-radius: 4px;
}

.chat-message.user .chat-bubble {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(0, 245, 255, 0.08));
  border: 1px solid var(--border-cyan);
  border-top-right-radius: 4px;
}

.chat-bubble-text {
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Typing dots animation */
.chat-typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
}

.chat-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--neon-purple);
  animation: typing-dot 1.2s ease infinite;
}

.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }

/* Chat input area */
.chat-input-area {
  padding: 1rem;
  border-top: 1px solid var(--border-dim);
  background: var(--bg-elevated);
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 0.7rem 0.9rem;
  background: var(--bg-input);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: none;
  outline: none;
  transition: var(--transition);
  line-height: 1.5;
}

.chat-input:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.1);
}

.chat-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.chat-input:disabled {
  opacity: 0.6;
}

.chat-send-btn {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--neon-cyan), #0099aa);
  color: #000;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  align-self: flex-end;
  letter-spacing: 0.04em;
}

.chat-send-btn:hover:not(:disabled) {
  box-shadow: var(--glow-cyan);
  transform: translateY(-1px);
}

.chat-send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-loading-dots {
  display: inline-flex;
  gap: 2px;
}

.chat-loading-dots span {
  animation: typing-dot 1.2s ease infinite;
  font-size: 1rem;
}
.chat-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.chat-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

/* =============================================
   LOADING STATES
   ============================================= */
.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  gap: 1.5rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--bg-elevated);
  border-top-color: var(--neon-pink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
}

.loading-shimmer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

/* =============================================
   ENHANCED LOADING SCREEN
   ============================================= */

.deck-loading-screen {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, var(--bg-deep) 0%, #0a0a15 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* Particle Background */
.particle-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  opacity: 0.6;
  animation: particle-float linear infinite;
  box-shadow: 0 0 10px currentColor;
}

@keyframes particle-float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(calc(-100vh - 20px)) scale(0.5);
    opacity: 0;
  }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 2rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* Neon Spinner */
.neon-spinner-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.neon-spinner-ring {
  position: absolute;
  inset: 0;
  animation: spinner-rotate 3s linear infinite;
}

.neon-spinner-orb {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
}

.neon-spinner-orb:nth-child(1) {
  color: var(--neon-pink);
  background: var(--neon-pink);
  animation: orb-orbit 2s ease-in-out infinite;
}

.neon-spinner-orb:nth-child(2) {
  color: var(--neon-cyan);
  background: var(--neon-cyan);
  animation: orb-orbit 2s ease-in-out infinite 0.66s;
}

.neon-spinner-orb:nth-child(3) {
  color: var(--neon-purple);
  background: var(--neon-purple);
  animation: orb-orbit 2s ease-in-out infinite 1.33s;
}

.neon-spinner-core {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bg-card), var(--bg-elevated));
  border: 2px solid var(--border-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(255, 45, 120, 0.3), inset 0 0 20px rgba(0, 245, 255, 0.1);
  animation: core-pulse 2s ease-in-out infinite;
}

.neon-core-glyph {
  font-size: 1.5rem;
  color: var(--neon-pink);
  text-shadow: var(--glow-pink);
  animation: glyph-shimmer 3s ease-in-out infinite;
}

.neon-spinner-trails {
  position: absolute;
  inset: 0;
  animation: trail-rotate 2s linear infinite;
}

.neon-trail {
  transform-origin: center;
  stroke-dasharray: 60 200;
  animation: trail-draw 2s ease-in-out infinite;
}

.neon-trail-delayed {
  animation-delay: 0.5s;
  opacity: 0.5;
}

@keyframes spinner-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes orb-orbit {
  0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
  50% { transform: translateX(-50%) translateY(8px) scale(1.2); }
}

@keyframes core-pulse {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 45, 120, 0.3), inset 0 0 20px rgba(0, 245, 255, 0.1);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 45, 120, 0.5), 0 0 80px rgba(191, 95, 255, 0.3), inset 0 0 30px rgba(0, 245, 255, 0.15);
    transform: scale(1.05);
  }
}

@keyframes glyph-shimmer {
  0%, 100% { 
    opacity: 1;
    filter: brightness(1);
  }
  33% { 
    opacity: 0.8;
    filter: brightness(1.3) drop-shadow(0 0 10px var(--neon-cyan));
  }
  66% { 
    opacity: 0.9;
    filter: brightness(1.2) drop-shadow(0 0 10px var(--neon-purple));
  }
}

@keyframes trail-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes trail-draw {
  0% { stroke-dashoffset: 260; }
  50% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -260; }
}

/* Progress Steps */
.loading-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.4s ease;
}

.step-pending .step-indicator {
  background: var(--bg-elevated);
  border: 2px solid var(--border-dim);
  color: var(--text-muted);
}

.step-active .step-indicator {
  background: linear-gradient(135deg, var(--neon-pink), var(--neon-purple));
  border: 2px solid var(--neon-pink);
  color: #fff;
  box-shadow: var(--glow-pink);
  animation: step-pulse 1.5s ease-in-out infinite;
}

.step-complete .step-indicator {
  background: var(--neon-green);
  border: 2px solid var(--neon-green);
  color: #000;
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.5);
}

.step-number {
  font-size: 0.85rem;
}

.step-check {
  font-size: 1rem;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.step-active .step-label {
  color: var(--text-primary);
}

.step-complete .step-label {
  color: var(--neon-green);
}

.step-connector {
  width: 40px;
  height: 2px;
  background: var(--border-dim);
  margin: 0 0.5rem;
  position: relative;
  overflow: hidden;
}

.step-connector::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--neon-green), var(--neon-cyan));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s ease;
}

.connector-complete::after {
  transform: scaleX(1);
}

@keyframes step-pulse {
  0%, 100% { 
    box-shadow: var(--glow-pink);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 25px rgba(255, 45, 120, 0.8), 0 0 50px rgba(191, 95, 255, 0.5);
    transform: scale(1.08);
  }
}

/* Animated Loading Text */
.animated-loading-text {
  font-size: 1.1rem;
  color: var(--text-muted);
  font-weight: 500;
  min-height: 1.6rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  text-align: center;
}

.animated-loading-text.text-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Loading Stats */
.loading-stats {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 245, 255, 0.08);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: var(--radius-md);
}

.loading-deck-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  max-width: 600px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: deck-name-reveal 0.6s ease-out;
}

@keyframes deck-name-reveal {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--neon-cyan);
  text-shadow: var(--glow-cyan);
}

.loading-stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Skeleton Grid Container */
.skeleton-grid-container {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  position: relative;
  z-index: 1;
}

/* Vignette overlay */
.deck-loading-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(13, 13, 26, 0.4) 100%);
  pointer-events: none;
  z-index: 0;
}

.skeleton-section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-title {
  width: 150px;
  height: 28px;
  border-radius: 8px;
}

.skeleton-count {
  width: 48px;
  height: 24px;
  border-radius: 12px;
}

.skeleton-card-wrapper {
  animation: skeleton-fade-in 0.4s ease forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes skeleton-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced shimmer for loading screen */
.deck-loading-screen .shimmer {
  background: linear-gradient(
    90deg,
    rgba(26, 26, 53, 0.6) 25%,
    rgba(45, 45, 85, 0.8) 50%,
    rgba(26, 26, 53, 0.6) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

/* Responsive loading screen */
@media (max-width: 900px) {
  .deck-loading-screen {
    padding: 1.5rem;
  }
  
  .loading-content {
    padding: 2rem 1rem;
  }
  
  .neon-spinner-container {
    width: 100px;
    height: 100px;
  }
  
  .neon-spinner-core {
    width: 48px;
    height: 48px;
  }
  
  .step-connector {
    width: 24px;
  }
  
  .step-label {
    font-size: 0.8rem;
  }
}

/* =============================================
   ERROR STATES
   ============================================= */
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: var(--neon-pink);
  text-shadow: var(--glow-pink);
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.error-message {
  color: var(--text-muted);
  max-width: 400px;
  font-size: 0.95rem;
}

.btn-secondary {
  padding: 0.7rem 1.5rem;
  background: transparent;
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary:hover {
  color: var(--neon-pink);
  border-color: var(--neon-pink);
  box-shadow: var(--glow-pink);
}

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 900px) {
  .deck-page {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  .deck-main {
    flex: none;
    overflow-y: visible;
    height: auto;
    padding: 1.25rem;
  }

  .chat-sidebar {
    flex: none;
    height: 500px;
    border-left: none;
    border-top: 1px solid var(--border-dim);
  }

  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 600px) {
  .import-page {
    padding: 2rem 1rem 1rem;
  }

  .tab-content {
    padding: 1.25rem;
  }

  .navbar {
    padding: 0 1rem;
  }

  .deck-stats-header {
    flex-direction: column;
  }

  .deck-stats-right {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}
`
