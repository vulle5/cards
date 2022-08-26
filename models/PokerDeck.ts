import Card, { Value, Suit } from "./Card.ts";
import CardDeck from "./CardDeck.ts";

class PokerDeck extends CardDeck {
  constructor() {
    // Create a uniq deck of cards that is in order
    const value = Object.values(Value);
    const suit = [Suit.Diamond, Suit.Heart, Suit.Club, Suit.Spade];
    const cards = [];
    for (let i = 0; i < suit.length; i++) {
      for (let j = 0; j < value.length; j++) {
        cards.push(new Card(value[j], suit[i]));
      }
    }
    super(cards);
  }

  static shuffled(times = 1): PokerDeck {
    const deck = new PokerDeck();
    for (let i = 0; i < times; i++) {
      deck.shuffle();
    }
    return deck;
  }
}

export default PokerDeck;
