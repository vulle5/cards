import Blinds from "./models/Blinds.ts";
import FrenchCard from "./models/FrenchCard.ts";
import Player from "./models/Player.ts";
import PokerGame from "./models/PokerGame.ts";

const pokerGame = new PokerGame({
  players: [
    new Player<FrenchCard>('Player 1'),
    new Player<FrenchCard>('Player 2'),
  ],
  blinds: new Blinds({ smallBlind: 100, bigBlind: 200, ante: 50 }),
  handSize: 2,
  betLimit: 100,
});

console.log(pokerGame);
