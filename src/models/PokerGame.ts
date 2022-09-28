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

    assert(this.#maxPlayers > 1, "Max players must be greater than 1.");
    // TODO: Add support for fewer than 3 players
    assert(this.#players.length > 2, "Must have at least 3 players.");
    assert(
      this.#players.length <= this.#maxPlayers,
      `Too many players. Max is ${this.#maxPlayers}.`
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

  /**
   * Amount is over or equal the minimum bet or minimum bet is zero.
   * @param amount The amount to bet.
   * @returns true if the amount is over or equal to the minimum bet or minimum bet is zero.
   */
  overOrEqualMinBet(amount: number): boolean {
    return amount >= this.#minBet || this.#minBet === 0;
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
   * Bet an amount of chips. Bets player's entire chip stack if they don't have enough chips.
   * @param player The player betting.
   * @param amount The amount of chips to bet.
   * @throws Error if amount is less than zero.
   * @throws Error if amount is less than minimum bet.
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
      assert(this.overOrEqualMinBet(amount), `Bet is too small. Min bet is ${this.#minBet}.`);

      player.chips -= amount;
      this.#pot += amount;
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

  start() {
    this.#collectBlinds();
    this.#minBet = this.blinds.bigBlind;
    this.#deck.shuffle();
    this.#deal();
  }

  #deal() {
    this.#players.forEach((player) => {
      player.cards = this.#deck.drawMany(this.#handSize);
    });
  }

  #collectBlinds() {
    this.bet(this.bigBlindPlayer, this.blinds.bigBlind);
    this.bet(this.smallBlindPlayer, this.blinds.smallBlind);
    this.#players.slice(2).forEach((player) => {
      this.bet(player, this.blinds.ante);
    });
  }

  // TODO: Add support for fewer than 3 players
  /** 
   * Rotate the blinds and the dealer.
  */
  #rotatePlayers() {
    // Rotate players array clockwise
    const lastPlayer = this.#players.pop();
    if (lastPlayer) {
      this.#players.unshift(lastPlayer);
    }
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
