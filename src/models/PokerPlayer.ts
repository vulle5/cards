import { assert } from 'testing/asserts.ts';
import PokerGame from './PokerGame.ts';

// TODO: Add unique ID to players
class PokerPlayer<T> {
  name: string;
  cards: T[];
  #chips = 0;
  folded = false;
  inAction = false;
  #game?: PokerGame;

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

    this.#chips = amount;
  }

  get game() {
    return this.#game;
  }
  set game(game: PokerGame | undefined) {
    this.#game = game;
  }

  /**
   * Checks if the player has chips and has not folded.
   * @returns true if the player has chips and folded is falsy.
  */
  canPlay() {
    return !this.folded && this.#chips > 0;
  }

  /**
   * Checks if a player is in the game.
   * @returns true if the player is in the game.
  */
  playerInGame(): boolean {
    if (!this.game) {
      return false;
    }

    return this.game.players.some(p => p.name === this.name);
  }

  /**
   * Checks if player is active (not folded and has chips).
   * @returns true if the player is active.
  */
  playerActive(): boolean {
    return this.canPlay() && this.playerInGame();
  }

  /**
   * Bet an amount of chips. Bets player's entire chip stack if they don't have enough chips.
   * @param amount The amount of chips to bet.
   * @throws Error if amount is less than zero.
   * @throws Error if amount is less than minimum bet.
   * @throws Error if the player is not in the game.
   * @throws Error if the player has already folded.
  */
  bet(amount: number) {
    assert(this.playerActive(), "Player is not active (folded or no chips).");
    if (!this.game) {
      throw new Error("Player is not in a game.");
    }

    // If player goes all in, bet all chips
    if (amount >= this.chips) {
      this.game.pot += this.chips;
      this.chips -= this.chips;
    } else {
      assert(this.game.overOrEqualMinBet(amount), `Bet is too small. Min bet is ${this.game.minBet}.`);

      this.chips -= amount;
      this.game.pot += amount;
    }
  }

  /**
   * Fold the player's hand.
   * @throws Error if the player is not in the game.
   * @throws Error if the player has already folded.
  */
  fold() {
    assert(this.playerActive(), "Player is not active (folded or no chips).");

    this.folded = true;
    this.cards = [];
  }

  /**
   * Make player check.
   * @throws Error if the player is not in the game.
   * @throws Error if the player has already folded.
   * @throws Error if it's not players turn.
  */
  check() {
    assert(this.playerActive(), "Player is not active (folded or no chips).");
    assert(this.game!.minBet > 0, "Minimum bet is not zero.");
  }
}

interface PlayerParameters<T> {
  cards?: T[];
  chips?: number;
}

export default PokerPlayer;
