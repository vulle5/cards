import { assert } from "../deps.ts";

class PokerPlayer<T> {
  name: string;
  cards: T[];
  #chips = 0;
  folded = false;

  constructor(name: string, { cards = [], chips = 0 }: PlayerParameters<T> = {}) {
    this.name = name;
    this.cards = cards;
    this.#chips = chips;
  }

  get chips() {
    return this.#chips;
  }

  set chips(amount: number) {
    assert(amount >= 0, "Amount must be greater than or equal to 0.");
    assert(amount <= this.#chips, "Amount must be less than or equal to the players chips.");

    this.#chips = amount;
  }
}

interface PlayerParameters<T> {
  cards?: T[];
  chips?: number;
}

export default PokerPlayer;
