import Blinds from "./models/Blinds.ts";
import FrenchCard from "./models/FrenchCard.ts";
import PokerPlayer from "./models/PokerPlayer.ts";
import PokerGame from "./models/PokerGame.ts";

const pokerGame = new PokerGame({
  players: [
    new PokerPlayer<FrenchCard>('Player 1', { chips: 1000 }),
    new PokerPlayer<FrenchCard>('Player 2', { chips: 500 }),
    new PokerPlayer<FrenchCard>('Player 3', { chips: 750 }),
  ],
  blinds: new Blinds({ smallBlind: 100, bigBlind: 200, ante: 50 }),
  handSize: 2,
  betLimit: 100,
});

pokerGame.start();
pokerGame.bet(pokerGame.players[0], 100);
pokerGame.bet(pokerGame.players[1], 400);
pokerGame.fold(pokerGame.players[2]);
pokerGame.bet(pokerGame.players[2], 750);
console.log(pokerGame.pot);
