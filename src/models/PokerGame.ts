import { assert } from "../deps.ts";

import Blinds from "./Blinds.ts";
import FrenchCard, { Value } from "./FrenchCard.ts";
import Player from "./Player.ts";
import PokerDeck from "./PokerDeck.ts";

class PokerGame {
  #players: Player<FrenchCard>[];
  #cardRanks: Value[] = defaultCardRanks;
  #deck: PokerDeck = new PokerDeck();
  #blinds: Blinds = new Blinds();
  #board: FrenchCard[] = [];
  #pot = 0;
  #handSize = 0;
  #betLimit? = 0;

  constructor({
    players,
    cardRanks = defaultCardRanks,
    deck = new PokerDeck(),
    blinds = new Blinds(),
    handSize = 0,
    betLimit = 0,
  }: PokerGameParameters) {
    this.#players = players;
    this.#cardRanks = cardRanks;
    this.#deck = deck;
    this.#blinds = blinds;
    this.#handSize = handSize;
    this.#betLimit = betLimit;

    assert(this.#players.length > 1, "Must have at least 2 players");
  }
}

interface PokerGameParameters {
  players: Player<FrenchCard>[];
  deck?: PokerDeck;
  handSize?: number;
  cardRanks?: Value[];
  blinds?: Blinds;
  betLimit?: number;
}

const defaultCardRanks = [
  Value.Two,
  Value.Three,
  Value.Four,
  Value.Five,
  Value.Six,
  Value.Seven,
  Value.Eight,
  Value.Nine,
  Value.Ten,
  Value.Jack,
  Value.Queen,
  Value.King,
  Value.Ace,
];

export default PokerGame;
