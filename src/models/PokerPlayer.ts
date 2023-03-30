import { assert } from 'testing/asserts.ts';
import PokerGame from './PokerGame.ts';

// TODO: Add unique ID to players
class PokerPlayer<T> {
  name: string;
  cards: T[];
  #chips = 0;
  folded = false;
  #game?: PokerGame;
  currentRoundBets = 0; // Bets made in the current betting round

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

  allIn(): boolean {
    return this.isActive() && this.#chips === 0;
  }

  /**
   * Collect chips from the player and add them to the pot.
   * @param amount The amount of chips to collect.
   * @throws Error if the player is not in the game.
   */
  collectChips(amount: number) {
    // FIXME: There must be a better way to make sure game is defined
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
   * @param betAmount The amount of chips to bet.
   * @throws Error if amount is less than zero.
   * @throws Error if amount is less than minimum bet.
   * @throws Error if the player is not in the game.
   * @throws Error if the player has already folded.
   */
  bet(betAmount: number) {
    assert(this.isActive(), 'Player is not active (folded or no chips).');
    if (!this.game) {
      throw new Error('Player is not in a game.');
    }

    // If player goes all in, bet all chips
    if (betAmount >= this.chips) {
      this.collectChips(this.chips);
    } else {
      assert(
        betAmount >= this.game.minBetForPlayer(this),
        `Bet is too small. Min bet for player is ${this.game.largestBet}.`,
      );

      this.collectChips(betAmount);
      // Update largest bet if this bet is larger
      if (betAmount > this.game.largestBet) {
        this.game.largestBet = betAmount;
      }
    }
    this.currentRoundBets += betAmount;
  }

  /**
   * Call the current bet.
   * If the player has already bet the same amount as the largest bet, do nothing.
   * @throws Error if the player is not in the game.
   */
  call() {
    if (!this.game) {
      throw new Error('Player is not in a game.');
    }

    if (this.game.largestBet > this.currentRoundBets) {
      this.bet(this.game.minBetForPlayer(this));
    }
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
   * @throws Error if the player has not matched the minimum bet.
   */
  check() {
    assert(this.isActive(), 'Player is not active (folded or no chips).');
    assert(
      this.currentRoundBets >= (this.game?.largestBet ?? 0),
      'Player must match the minimum bet to check.',
    );
  }
}

interface PlayerParameters<T> {
  cards?: T[];
  chips?: number;
}

export default PokerPlayer;
