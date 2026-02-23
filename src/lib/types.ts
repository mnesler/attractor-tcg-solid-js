export interface DeckCard {
  quantity: number
  name: string
  scryfallCard?: ScryfallCard
}

export interface ScryfallCard {
  id: string
  name: string
  type_line: string
  mana_cost?: string
  oracle_text?: string
  image_uris?: { normal: string; large: string; small: string }
  card_faces?: Array<{ image_uris?: { normal: string; large: string } }>
  colors?: string[]
  color_identity: string[]
  cmc: number
}

export interface Deck {
  id: string
  name: string
  commander?: DeckCard[]
  mainboard: DeckCard[]
  format: string
}

export interface ChatResult {
  content?: string
  error?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type CardType =
  | 'Commander'
  | 'Creature'
  | 'Instant'
  | 'Sorcery'
  | 'Artifact'
  | 'Enchantment'
  | 'Planeswalker'
  | 'Land'
  | 'Other'

export const CARD_TYPE_ORDER: CardType[] = [
  'Commander',
  'Creature',
  'Instant',
  'Sorcery',
  'Artifact',
  'Enchantment',
  'Planeswalker',
  'Land',
  'Other',
]

export function getCardType(card: DeckCard, isCommander: boolean): CardType {
  if (isCommander) return 'Commander'
  const typeLine = card.scryfallCard?.type_line ?? ''
  if (typeLine.includes('Creature')) return 'Creature'
  if (typeLine.includes('Instant')) return 'Instant'
  if (typeLine.includes('Sorcery')) return 'Sorcery'
  if (typeLine.includes('Artifact')) return 'Artifact'
  if (typeLine.includes('Enchantment')) return 'Enchantment'
  if (typeLine.includes('Planeswalker')) return 'Planeswalker'
  if (typeLine.includes('Land')) return 'Land'
  return 'Other'
}
