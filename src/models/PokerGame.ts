import { assert } from 'testing/asserts.ts';
import Blinds from './Blinds.ts';
import FrenchCard, { Value } from './FrenchCard.ts';
import PokerPlayer from './PokerPlayer.ts';
import PokerDeck from './PokerDeck.ts';
import * as PokerGameErrors from './PokerGameErrors.ts';

class PokerGame {
  blinds: Blinds;
  #board: FrenchCard[] = [];
  #deck: PokerDeck;
  #handSize = 2;
  #maxPlayers;
  #largestBet = 0;
  #players: PokerPlayer<FrenchCard>[];
  #playerInAction: PokerPlayer<FrenchCard>;
  #pot = 0;

  constructor({
    blinds = new Blinds(),
    deck = new PokerDeck(),
    maxPlayers = 8,
    players,
  }: PokerGameParameters) {
    this.blinds = blinds;
    this.#deck = deck;
    this.#maxPlayers = maxPlayers;
    this.#players = players;
    this.#playerInAction = this.players[0];
    this.#registerPlayers();

    assert(this.#maxPlayers > 1, 'Max players must be greater than 1.');
    assert(this.#players.length >= 2, 'Must have at least 2 players.');
    assert(
      this.#players.length <= this.#maxPlayers,
      `Too many players. Max is ${this.#maxPlayers}.`,
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
  get players() {
    return this.#players;
  }
  get maxPlayers() {
    return this.#maxPlayers;
  }
  get playerInAction(): PokerPlayer<FrenchCard> {
    return this.#playerInAction;
  }
  get dealer(): PokerPlayer<FrenchCard> {
    assert(this.#players.length >= 1, 'Must have at least 1 player.');

    return this.#players.at(-1)!;
  }
  get smallBlindPlayer(): PokerPlayer<FrenchCard> {
    assert(this.#players.length >= 1, 'Must have at least 1 player.');

    if (this.players.length >= 3) {
      return this.#players.at(-2)!;
    } else {
      return this.dealer;
    }
  }
  get bigBlindPlayer(): PokerPlayer<FrenchCard> {
    assert(this.#players.length >= 1, 'Must have at least 1 player.');

    if (this.players.length >= 3) {
      return this.#players.at(-3)!;
    } else {
      return this.#players[0];
    }
  }

  get largestBet() {
    return this.#largestBet;
  }
  set largestBet(amount: number) {
    this.#largestBet = amount;
  }
  get pot() {
    return this.#pot;
  }
  set pot(amount: number) {
    assert(amount >= 0, 'Amount must be greater than or equal to 0.');

    this.#pot = amount;
  }

  gameFull(): boolean {
    return this.players.length >= this.maxPlayers;
  }

  /**
   * Returns true if the round of betting is over.
   * @note This does not mean the game or hand is over.
   */
  roundOver(): boolean {
    const activePlayers = this.activePlayers();
    // FIXME: This condition should end the hand. Implement method that checks if hand is over.
    if (activePlayers.length === 1) {
      return true;
    }
    if (activePlayers.every((player) => player.allIn())) {
      return true;
    }
    if (
      this.blinds.total > 0 &&
      activePlayers.every((player) => this.minBetForPlayer(player) === 0)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   * @throws Error if the game is full.
   * @throws Error if the player is already in the game.
   */
  addPlayer(player: PokerPlayer<FrenchCard>) {
    assert(this.gameFull(), 'Game is full.');
    assert(player.inGame(), 'Player is already in the game.');

    this.#players.push(player);
  }

  /**
   * The amount a player must bet this round to stay in the game.
   * @param player The player to check.
   * @returns minimum bet amount.
   */
  minBetForPlayer<T>(player: PokerPlayer<T>): number {
    return this.largestBet - player.currentRoundBets;
  }

  start() {
    this.#collectForcedBets();
    this.deck.shuffle();
    this.#deal();
  }

  act(action: Action) {
    const player = this.playerInAction;

    if (player) {
      assert(player.isActive(), 'Player is not active.');

      switch (action.type) {
        case 'raise':
        case 'bet':
          player.bet(action.amount ?? 0);
          break;
        case 'call':
          player.call();
          break;
        case 'check':
          player.check();
          break;
        case 'fold':
          player.fold();
          break;
      }

      this.#setNextPlayerInAction();
    } else {
      throw new PokerGameErrors.GameStateError('No player in action.');
    }
  }

  #deal() {
    this.players.forEach((player) => {
      player.cards = this.deck.drawMany(this.handSize);
    });
  }

  #collectForcedBets() {
    this.bigBlindPlayer.collectChips(this.blinds.bigBlind);
    this.smallBlindPlayer.collectChips(this.blinds.smallBlind);
    // Set the current bet for each player to the amount of the blinds.
    this.bigBlindPlayer.currentRoundBets = this.blinds.bigBlind;
    this.smallBlindPlayer.currentRoundBets = this.blinds.smallBlind;
    // Take ante from all of the players
    // Ante is considered a "dead" bet, it does not count towards the pot.
    this.players.forEach((player) => {
      player.collectChips(this.blinds.ante);
    });
    // Check what blind was the largest and set the largest bet to that amount.
    this.#largestBet = this.#players.reduce(
      (
        acc,
        player,
      ) => (player.currentRoundBets > acc ? player.currentRoundBets : acc),
      0,
    );
  }

  #setNextPlayerInAction() {
    if (this.roundOver()) return;

    const nextPlayerInAction = this.players.slice(
      this.players.indexOf(this.#playerInAction) + 1,
    ).find((player) => player.isActive() && !player.allIn()) ??
      this.players[0];
    if (nextPlayerInAction) {
      this.#playerInAction = nextPlayerInAction;
    }
  }

  private activePlayers() {
    return this.players.filter((player) => player.isActive());
  }

  // TODO: Implement method
  /**
   * Rotate the blinds and the dealer.
   */
  #rotatePlayers() {}

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

export type ActionType = 'raise' | 'call' | 'bet' | 'check' | 'fold';

export interface Action {
  type: ActionType;
  amount?: number;
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
] as const;

export default PokerGame;
