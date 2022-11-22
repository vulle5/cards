class PokerGameError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class GameStateError extends PokerGameError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}
