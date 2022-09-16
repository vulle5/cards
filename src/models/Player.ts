import { assert } from "../deps.ts";

class Player<T> {
  cards: T[];
  chips = 0;

  constructor(cards: T[], chips = 0) {
    this.cards = cards;
    this.chips = chips;

    assert(this.cards.length > 0, "Must have at least 1 card");
  }
}

export default Player;
