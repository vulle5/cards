import Blinds from "./models/Blinds.ts";
import FrenchCard, { Suit, Value } from "./models/FrenchCard.ts";
import Player from "./models/Player.ts";
import PokerGame from "./models/PokerGame.ts";

const binds = new Blinds({ smallBlind: 100, bigBlind: 200, ante: 50 });
const pokerGame = new PokerGame({
  players: [
    new Player<FrenchCard>([new FrenchCard(Value.Ace, Suit.Spade)], 1000),
    new Player<FrenchCard>([new FrenchCard(Value.Ace, Suit.Spade)], 1000),
  ],
  blinds: binds,
  handSize: 2,
  betLimit: 100,
});

console.log(pokerGame);
