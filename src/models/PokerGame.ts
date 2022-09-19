import { assert } from "../deps.ts";
import Blinds from "./Blinds.ts";
import FrenchCard, { Value } from "./FrenchCard.ts";
import Player from "./Player.ts";
import PokerDeck from "./PokerDeck.ts";

class PokerGame {
  #players: Player<FrenchCard>[];
  #cardRanks: Value[];
  #deck: PokerDeck;
  #board: FrenchCard[] = [];
  #pot = 0;
  #handSize = 2;
  blinds: Blinds;
  #betLimit;
  #maxPlayers; 

  constructor({
    players,
    cardRanks = defaultCardRanks,
    deck = new PokerDeck(),
    blinds = new Blinds(),
    betLimit = 0,
    maxPlayers = 8,
  }: PokerGameParameters) {
    this.#players = players;
    this.#cardRanks = cardRanks;
    this.#deck = deck;
    this.blinds = blinds;
    this.#betLimit = betLimit;
    this.#maxPlayers = maxPlayers;
    
    assert(this.#maxPlayers > 1, "Max players must be greater than 1.");
    assert(this.#players.length > 1, "Must have at least 2 players.");
    assert(this.#players.length <= this.#maxPlayers, `Too many players. Max is ${this.#maxPlayers}.`);
    assert(this.#betLimit >= 0, "Bet limit must be greater than or equal to 0.");
    // Otherwise the game can run out of cards
    assert(this.#maxPlayers < 24, "Max players must be less than 24.");
  }

  get pot() {
    return this.#pot;
  }
  get board() {
    return this.#board;
  }
  get handSize() {
    return this.#handSize;
  }
  get cardRanks() {
    return this.#cardRanks;
  }
  get dealer() {
    return this.#players[0];
  }

  set betLimit(limit: number) {
    assert(limit >= 0, "Bet limit must be greater than or equal to 0.");
    this.#betLimit = limit;
  }

  #deal() {
    this.#players.forEach((player) => {
      player.cards = this.#deck.drawMany(this.#handSize);
    });
  }

  #reset() {
    this.#deck = new PokerDeck();
    this.#board = [];
    this.#pot = 0;
  }

  gameFull(): boolean {
    return this.#players.length === this.#maxPlayers;
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   * @returns True if the player was added, false if the game is full.
   * @throws Error if the player is already in the game.
   */
  addPlayer(player: Player<FrenchCard>): boolean {
    if (this.gameFull()) {
      // TODO: Use unique ID instead of name
      if (this.#players.includes(player)) {
        throw new PokerGameError("Player is already in the game.");
      }
      this.#players.push(player);
      return true
    }

    return false
  }

  // Texas Hold'em only
  // TODO: Add support for other poker variants

  #dealFlop() {
    const flop = this.#deck.drawMany(3);
    if (flop.length === 3) {
      this.#board.push(...flop);
    }
  }

  #dealTurnOrRiver() {
    this.#board.push(this.#deck.draw()!);
  }
}

interface PokerGameParameters {
  players: Player<FrenchCard>[];
  maxPlayers?: number;
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

class PokerGameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PokerGameError";
  }
}

export default PokerGame;
