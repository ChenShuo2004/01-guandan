import { type Card, NORMAL_RANKS, SUITS, sortCards } from "@/lib/guandan/card";

export function createDeck(): Card[] {
  const cards: Card[] = [];

  for (const deckIndex of [1, 2] as const) {
    for (const suit of SUITS) {
      for (const rank of NORMAL_RANKS) {
        cards.push({
          id: `${deckIndex}-${suit}-${rank}`,
          suit,
          rank,
          isJoker: false,
          deckIndex
        });
      }
    }

    cards.push({
      id: `${deckIndex}-joker-small`,
      suit: "joker",
      rank: 16,
      isJoker: true,
      deckIndex
    });

    cards.push({
      id: `${deckIndex}-joker-big`,
      suit: "joker",
      rank: 17,
      isJoker: true,
      deckIndex
    });
  }

  return cards;
}

export function shuffleDeck(cards: Card[], seed = Date.now()) {
  const shuffled = [...cards];
  const random = createSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function dealCards(deck: Card[], playerCount = 4) {
  const hands = Array.from({ length: playerCount }, () => [] as Card[]);

  deck.forEach((card, index) => {
    hands[index % playerCount].push(card);
  });

  return hands.map((hand) => sortCards(hand));
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return function random() {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
