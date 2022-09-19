class Player<T> {
  name: string;
  cards: T[];
  chips = 0;

  constructor(name: string, { cards = [], chips = 0 }: PlayerParameters<T> = {}) {
    this.name = name;
    this.cards = cards;
    this.chips = chips;
  }
}

interface PlayerParameters<T> {
  cards?: T[];
  chips?: number;
}

export default Player;
