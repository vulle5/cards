import Blinds from "./models/Blinds.ts";
import FrenchCard from "./models/FrenchCard.ts";
import PokerPlayer from "./models/PokerPlayer.ts";
import PokerGame, { ActionType } from "./models/PokerGame.ts";

const pokerGame = new PokerGame({
  players: [
    new PokerPlayer<FrenchCard>('Player 1', { chips: 1000 }),
    new PokerPlayer<FrenchCard>('Player 2', { chips: 500 }),
    new PokerPlayer<FrenchCard>('Player 3', { chips: 750 }),
  ],
  blinds: new Blinds({ smallBlind: 25, bigBlind: 50, ante: 10 }),
  handSize: 2
});

// TODO:
// - Player order is incorrect. Player left of small blind should be first to act.
// - Handle rounds of betting
// - PokerPlayer tests

pokerGame.start();
pokerGame.act({ type: ActionType.Bet, amount: 100 });
pokerGame.act({ type: ActionType.Bet, amount: 400 });
pokerGame.act({ type: ActionType.Bet, amount: 750 });
console.log(pokerGame.pot);
