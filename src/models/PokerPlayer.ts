import { assert } from 'testing/asserts.ts';
import PokerGame from './PokerGame.ts';

// TODO: Add unique ID to players
class PokerPlayer<T> {
  name: string;
  cards: T[];
  #chips = 0;
  folded = false;
  #game?: PokerGame;
  currentBet = 0; // Bets made in the current betting round

  constructor(
    name: string,
    { cards = [], chips = 0 }: PlayerParameters<T> = {},
  ) {
    this.name = name;
    this.cards = cards;
    this.#chips = chips;
  }

  get chips() {
    return this.#chips;
  }

  set chips(amount: number) {
    assert(amount >= 0, 'Amount must be greater than or equal to 0.');

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
   * @returns true if the player has chips and has not folded.
   */
  canPlay() {
    return !this.folded && this.#chips > 0;
  }

  /**
   * Checks if a player is in the game.
   * @returns true if the player is in the game.
   */
  inGame(): boolean {
    if (!this.game) {
      return false;
    }

    return this.game.players.some((p) => p.name === this.name);
  }

  /**
   * Checks if player is not folded and is in game.
   * @returns true if the player is active.
   */
  isActive(): boolean {
    return !this.folded && this.inGame();
  }

  /**
   * Collect chips from the player and add them to the pot.
   * @param amount The amount of chips to collect.
   * @throws Error if the player is not in the game.
   */
  collectChips(amount: number) {
    if (!this.game) {
      throw new Error('Player is not in a game.');
    }

    if (amount >= this.chips) {
      this.game.pot += this.chips;
      this.chips -= this.chips;
    } else {
      this.chips -= amount;
      this.game.pot += amount;
    }
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
    assert(this.isActive(), 'Player is not active (folded or no chips).');
    if (!this.game) {
      throw new Error('Player is not in a game.');
    }

    // If player goes all in, bet all chips
    if (amount >= this.chips) {
      this.collectChips(this.chips);
    } else {
      assert(
        amount >= this.game.minBet,
        `Bet is too small. Min bet is ${this.game.minBet}.`,
      );

      this.collectChips(amount);
      this.game.minBet = amount;
    }
    this.currentBet += amount;
  }

  /**
   * Fold the player's hand.
   * @throws Error if the player is not in the game.
   * @throws Error if the player has already folded.
   */
  fold() {
    assert(this.isActive(), 'Player is not active (folded or no chips).');

    this.folded = true;
    this.cards = [];
  }

  /**
   * Make player check.
   * @throws Error if the player is not in the game.
   * @throws Error if the player has already folded.
   */
  check() {
    assert(this.isActive(), 'Player is not active (folded or no chips).');
    assert(this.game!.minBet > 0, 'Minimum bet is not zero.');
  }
}

interface PlayerParameters<T> {
  cards?: T[];
  chips?: number;
}

export default PokerPlayer;
