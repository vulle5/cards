export enum Suit {
  Diamond,
  Heart,
  Club,
  Spade,
}
export enum Value {
  One = "1",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
  Ace = "A",
}

class FrenchCard {
  readonly value: Value;
  readonly suit: Suit;

  constructor(value: Value, suit: Suit) {
    this.value = value;
    this.suit = suit;
  }

  static random(): FrenchCard {
    const value =
      Object.values(Value)[
        Math.floor(Math.random() * Object.values(Value).length)
      ];

    const enumIndexes = Object.values(Suit)
      .map((n) => Number.parseInt(n as string))
      .filter((n) => !Number.isNaN(n));
    const suit = enumIndexes[Math.floor(Math.random() * enumIndexes.length)];

    return new FrenchCard(value, suit);
  }

  toString(): string {
    return `${this.value} of ${Suit[this.suit]}s`;
  }
}

export default FrenchCard;
