import Card from './Card.ts';

class CardDeck {
  #cards: Card[]

  constructor(cards: Card[]) {
    this.#cards = cards
  }
  
  public get cards(): Card[] {
    return this.#cards;
  }

  /**
   * Pick a random card from the deck.
   * @returns The card, or undefined if the deck is empty.
   */
  pick(): Card | undefined {
    return this.#cards.splice(Math.floor(Math.random() * this.#cards.length), 1)[0]
  }
  
  /**
   * Draw a card from top of the deck.
   * @returns The card, or undefined if the deck is empty.
   */
  draw(): Card | undefined {
    return this.#cards.pop();
  }

  /**
   * Adds card to the bottom of the deck.
   * @param card The card to add.
   * @returns The deck after addition.
   */
  add(card: Card): CardDeck {
    this.#cards.push(card)
    return this
  }

  // Fisher-Yates shuffle
  shuffle(): CardDeck {
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

export default CardDeck
