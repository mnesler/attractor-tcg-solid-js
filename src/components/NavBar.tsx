import { Link } from '@tanstack/solid-router'

export default function NavBar() {
  return (
    <nav class="navbar">
      <Link to="/" class="navbar-brand">
        <span class="brand-glyph" aria-hidden="true">✦</span>
        <span class="brand-text">EDH Builder</span>
      </Link>
      <div class="navbar-links">
        <Link
          to="/"
          class="nav-link"
          activeProps={{ class: 'nav-link active' }}
        >
          Import Deck
        </Link>
      </div>
    </nav>
  )
}
