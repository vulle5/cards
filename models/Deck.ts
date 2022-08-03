import Card from './Card.ts';

class Deck {
  #cards: Card[]

  constructor(cards: Card[]) {
    this.#cards = cards
  }

  static random(length: number): Deck {
    const cards = Array(length).fill(0).map(Card.random)
    return new Deck(cards)
  }
  
  public get cards(): Card[] {
    return this.#cards;
  }
  
  draw(): Card | undefined {
    return this.#cards.pop();
  }

  add(card: Card): Deck {
    this.#cards.push(card)
    return this
  }

  // Fisher-Yates shuffle
  shuffle(): Deck {
    for (let i = this.#cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.#cards[i], this.#cards[j]] = [this.#cards[j], this.#cards[i]];
    }
    return this
  }

  toString(): string {
    return this.#cards.map(c => c.toString()).join(', ')
  }
}

export default Deck
