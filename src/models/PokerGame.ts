import { assert } from 'testing/asserts.ts';
import Blinds from "./Blinds.ts";
import FrenchCard, { Value } from "./FrenchCard.ts";
import PokerPlayer from "./PokerPlayer.ts";
import PokerDeck from "./PokerDeck.ts";

class PokerGame {
  blinds: Blinds;
  #board: FrenchCard[] = [];
  #cardRanks: Value[];
  #deck: PokerDeck;
  #handSize = 2;
  #maxPlayers;
  #minBet = 0;
  #players: PokerPlayer<FrenchCard>[];
  #pot = 0;

  constructor({
    blinds = new Blinds(),
    cardRanks = defaultCardRanks,
    deck = new PokerDeck(),
    maxPlayers = 8,
    players
  }: PokerGameParameters) {
    this.blinds = blinds;
    this.#cardRanks = cardRanks;
    this.#deck = deck;
    this.#maxPlayers = maxPlayers;
    this.#players = players;
    this.#registerPlayers();

    assert(this.#maxPlayers > 1, "Max players must be greater than 1.");
    // TODO: Add support for fewer than 3 players
    assert(this.#players.length > 2, "Must have at least 3 players.");
    assert(
      this.#players.length <= this.#maxPlayers,
      `Too many players. Max is ${this.#maxPlayers}.`
    );
  }

  get board() {
    return this.#board;
  }
  get deck() {
    return this.#deck;
  }
  get handSize() {
    return this.#handSize;
  }
  get cardRanks() {
    return this.#cardRanks;
  }
  get players() {
    return this.#players;
  }
  get minBet() {
    return this.#minBet;
  }
  get maxPlayers() {
    return this.#maxPlayers;
  }
  // TODO: Add support for fewer than 3 players
  get dealer(): PokerPlayer<FrenchCard> {
    return this.#players.at(0) as PokerPlayer<FrenchCard>;
  }
  // TODO: Add support for fewer than 3 players
  get smallBlindPlayer(): PokerPlayer<FrenchCard> {
    return this.#players.at(1) as PokerPlayer<FrenchCard>;
  }
  // TODO: Add support for fewer than 3 players
  get bigBlindPlayer(): PokerPlayer<FrenchCard> {
    return this.#players.at(2) as PokerPlayer<FrenchCard>;
  }

  get pot() {
    return this.#pot;
  }
  set pot(amount: number) {
    assert(amount >= 0, "Amount must be greater than or equal to 0.");

    this.#pot = amount;
  }

  gameFull(): boolean {
    return this.players.length >= this.maxPlayers;
  }

  /**
   * Amount is over or equal the minimum bet or minimum bet is zero.
   * @param amount The amount to bet.
   * @returns true if the amount is over or equal to the minimum bet or minimum bet is zero.
   */
  overOrEqualMinBet(amount: number): boolean {
    return amount >= this.minBet || this.minBet === 0;
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   * @throws Error if the game is full.
   * @throws Error if the player is already in the game.
  */
  addPlayer(player: PokerPlayer<FrenchCard>) {
    assert(this.gameFull(), "Game is full.");
    assert(player.playerInGame(), "Player is already in the game.");

    this.#players.push(player);
  }

  // TODO: Add support for fewer than 3 players
  start() {
    this.#collectBlinds();
    this.#minBet = this.blinds.bigBlind;
    this.deck.shuffle();
    this.#deal();
    const playerInAction = this.players.at(3) ?? this.players.at(0);
    if (playerInAction) {
      playerInAction.inAction = true;
    }
  }

  #deal() {
    this.players.forEach((player) => {
      player.cards = this.deck.drawMany(this.handSize);
    });
  }

  #collectBlinds() {
    this.bigBlindPlayer.bet(this.blinds.bigBlind);
    this.smallBlindPlayer.bet(this.blinds.smallBlind);
    [this.dealer, ...this.players.slice(3)].forEach((player) => {
      player.bet(this.blinds.ante);
    });
  }

  // TODO: Add support for fewer than 3 players
  /** 
   * Rotate the blinds and the dealer.
  */
  #rotatePlayers() {
    // Rotate players array clockwise
    const lastPlayer = this.players.pop();
    if (lastPlayer) {
      this.players.unshift(lastPlayer);
    }
  }

  #registerPlayers() {
    this.players.forEach((player) => {
      player.game = this;
    });
  }
}

export interface PokerGameParameters {
  blinds?: Blinds;
  cardRanks?: Value[];
  deck?: PokerDeck;
  handSize?: number;
  maxPlayers?: number;
  players: PokerPlayer<FrenchCard>[];
}

export const defaultCardRanks = [
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
