import { assert } from "../deps.ts";
import Blinds from "./Blinds.ts";
import FrenchCard, { Value } from "./FrenchCard.ts";
import PokerPlayer from "./PokerPlayer.ts";
import PokerDeck from "./PokerDeck.ts";

class PokerGame {
  #players: PokerPlayer<FrenchCard>[];
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
    maxPlayers = 8,
    betLimit = 0,
  }: PokerGameParameters) {
    this.#players = players;
    this.#cardRanks = cardRanks;
    this.#deck = deck;
    this.blinds = blinds;
    this.#maxPlayers = maxPlayers;
    this.#betLimit = betLimit;

    assert(this.#maxPlayers > 1, "Max players must be greater than 1.");
    // TODO: Add support for 2 players
    assert(this.#players.length > 2, "Must have at least 3 players.");
    assert(
      this.#players.length <= this.#maxPlayers,
      `Too many players. Max is ${this.#maxPlayers}.`
    );
    assert(
      this.#betLimit >= 0,
      "Bet limit must be greater than or equal to 0."
    );
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
  get players() {
    return this.#players;
  }
  get dealer(): PokerPlayer<FrenchCard> {
    return this.#players.at(-1) as PokerPlayer<FrenchCard>;
  }
  get smallBlindPlayer(): PokerPlayer<FrenchCard> {
    return this.#players.at(1) as PokerPlayer<FrenchCard>;
  }
  get bigBlindPlayer(): PokerPlayer<FrenchCard> {
    return this.#players.at(0) as PokerPlayer<FrenchCard>;
  }

  get betLimit() {
    return this.#betLimit;
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

  // TODO: Add unique ID to players
  /**
   * Checks if a player is in the game.
   * @param player The player to check.
   * @returns true if the player is in the game.
   */
  playerInGame(player: PokerPlayer<FrenchCard>): boolean {
    return this.#players.some(p => p.name === player.name);
  }

  /**
   * Checks if player is active (not folded and has chips).
   * @param player The player to check.
   * @returns true if the player is active.
   */
  playerActive(player: PokerPlayer<FrenchCard>): boolean {
    return player.canPlay() && this.playerInGame(player);
  }

  gameFull(): boolean {
    return this.#players.length >= this.#maxPlayers;
  }

  noLimitBetting(): boolean {
    return this.#betLimit === 0;
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   * @throws Error if the game is full.
   * @throws Error if the player is already in the game.
  */
  addPlayer(player: PokerPlayer<FrenchCard>) {
    assert(this.gameFull(), "Game is full.");
    assert(this.playerInGame(player), "Player is already in the game.");

    this.#players.push(player);
  }

  /**
   * Bet an amount of chips.
   * @param player The player betting.
   * @param amount The amount of chips to bet.
   * @throws Error if amount is less than zero.
   * @throws Error if the player is not in the game.
   * @throws Error if the player does not have enough chips.
   * @throws Error if the player has already folded.
  */
  bet(player: PokerPlayer<FrenchCard>, amount: number) {
    assert(this.playerActive(player), "Player is not active (folded or no chips).");

    const playerGoesAllIn = amount >= player.chips;
    if (playerGoesAllIn) {
      this.#pot += player.chips;
      player.chips -= player.chips;
    } else {
      if (this.noLimitBetting() || amount >= this.#betLimit) {
        player.chips -= amount;
        this.#pot += amount;
      }
    }
  }

  /**
   * Fold the player's hand.
   * @param player The player folding.
   * @throws Error if the player is not in the game.
   * @throws Error if the player has already folded.
  */
  fold(player: PokerPlayer<FrenchCard>) {
    assert(this.playerActive(player), "Player is not active (folded or no chips).");

    player.folded = true;
    player.cards = [];
  }

  // TODO: Add support for other poker variants

  start() {
    this.#deck.shuffle();
    this.#deal();
    // TODO: Collect blinds to pot
  }

  // TODO: Add support for fewer than 3 players
  /** 
   * Rotate the blinds and the dealer.
  */
  #rotatePlayers() {
    // Rotate players array clockwise
    const lastPlayer = this.#players.pop();
    this.#players.unshift(lastPlayer!);
  }

  #dealFlop() {
    const flop = this.#deck.drawMany(3);
    this.#board.push(...flop);
  }

  #dealTurnOrRiver() {
    this.#board.push(this.#deck.draw()!);
  }
}

interface PokerGameParameters {
  players: PokerPlayer<FrenchCard>[];
  maxPlayers?: number;
  deck?: PokerDeck;
  handSize?: number;
  cardRanks?: Value[];
  blinds?: Blinds;
  betLimit?: number;
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
