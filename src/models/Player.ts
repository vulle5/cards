class Player<T> {
  cards: T[];
  chips = 0;

  constructor(cards: T[], chips = 0) {
    this.cards = cards;
    this.chips = chips;
  }
}

export default Player;
