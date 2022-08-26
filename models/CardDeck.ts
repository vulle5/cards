class CardDeck<T> {
  #cards: T[]

  constructor(cards: T[]) {
    this.#cards = cards
  }
  
  get cards(): T[] {
    return this.#cards;
  }
  get length(): number {
    return this.#cards.length;
  }

  /**
   * Pick a random card from the deck.
   * @returns The card, or undefined if the deck is empty.
   */
  pick(): T | undefined {
    return this.#cards.splice(Math.floor(Math.random() * this.#cards.length), 1)[0]
  }
  
  /**
   * Draw a card from top of the deck.
   * @returns The card, or undefined if the deck is empty.
   */
  draw(): T | undefined {
    return this.#cards.pop();
  }

  /**
   * Adds card to the bottom of the deck.
   * @param card The card to add.
   * @returns The deck after addition.
   */
  add(card: T): CardDeck<T> {
    this.#cards.push(card)
    return this
  }

  // Fisher-Yates shuffle
  shuffle(): CardDeck<T> {
    for (let i = this.#cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.#cards[i], this.#cards[j]] = [this.#cards[j], this.#cards[i]];
    }
    return this
  }
}

export default CardDeck
