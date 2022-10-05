import { assert } from 'testing/asserts.ts';
import Blinds from "./Blinds.ts";
import FrenchCard, { Value } from "./FrenchCard.ts";
import PokerPlayer from "./PokerPlayer.ts";
import PokerDeck from "./PokerDeck.ts";
import * as PokerGameErrors from "./PokerGameErrors.ts";

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
    assert(this.#players.length >= 2, "Must have at least 2 players.");
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
  get dealer(): PokerPlayer<FrenchCard> {
    return this.#players.at(-1)!;
  }
  get smallBlindPlayer(): PokerPlayer<FrenchCard> {
    if (this.players.length >= 3) {
      return this.#players.at(-2)!;
    } else {
      return this.dealer;
    }
  }
  get bigBlindPlayer(): PokerPlayer<FrenchCard> {
    if (this.players.length >= 3) {
      return this.#players.at(-3)!;
    } else {
      return this.#players.at(0)!;
    }
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

  playerInAction(): PokerPlayer<FrenchCard> | undefined {
    return this.players.find((player) => player.inAction);
  }

  start() {
    this.#collectForcedBets();
    this.#minBet = this.blinds.bigBlind;
    this.deck.shuffle();
    this.#deal();
    this.#setFirstPlayerInAction();
  }

  act(action: Action) {
    const player = this.playerInAction();

    if (player) {
      assert(player.playerActive(), "Player is not active.");

      switch (action.type) {
        case "raise":
        case "call":
        case "bet":
          player.bet(action.amount ?? 0);
          break;
        case "check":
          player.check();
          break;
        case "fold":
          player.fold();
          break;
      }
      
      this.#setNextPlayerInAction();
    } else {
      throw new PokerGameErrors.GameStateError("No player in action.");
    }
  }

  #deal() {
    this.players.forEach((player) => {
      player.cards = this.deck.drawMany(this.handSize);
    });
  }

  #collectForcedBets() {
    this.bigBlindPlayer.bet(this.blinds.bigBlind);
    this.smallBlindPlayer.bet(this.blinds.smallBlind);
    // Take ante from all of the players
    this.players.forEach((player) => {
      player.bet(this.blinds.ante);
    });
  }

  #setFirstPlayerInAction() {
    const playerInAction = this.players.at(3) ?? this.players.at(0);
    if (playerInAction) {
      playerInAction.inAction = true;
    }
  }

  #setNextPlayerInAction() {
    const playerInAction = this.playerInAction();
    if (playerInAction) {
      playerInAction.inAction = false;
    }

    const nextPlayerInAction = this.players.at(
      this.players.indexOf(playerInAction!) + 1
    ) ?? this.players.at(0);
    if (nextPlayerInAction) {
      nextPlayerInAction.inAction = true;
    }
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

export enum ActionType {
  Bet = "bet",
  Call = "call",
  Check = "check",
  Fold = "fold",
  Raise = "raise"
}

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
];

export default PokerGame;
