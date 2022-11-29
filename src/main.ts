import Blinds from './models/Blinds.ts';
import FrenchCard from './models/FrenchCard.ts';
import PokerPlayer from './models/PokerPlayer.ts';
import PokerGame from './models/PokerGame.ts';

const pokerGame = new PokerGame({
  players: [
    new PokerPlayer<FrenchCard>('Player 1', { chips: 1000 }),
    new PokerPlayer<FrenchCard>('Player 2', { chips: 500 }),
    new PokerPlayer<FrenchCard>('Player 3', { chips: 750 }),
  ],
  blinds: new Blinds({ smallBlind: 25, bigBlind: 50, ante: 10 }),
  handSize: 2,
});

pokerGame.start();
pokerGame.act({ type: 'bet', amount: 100 });
pokerGame.act({ type: 'bet', amount: 400 });
pokerGame.act({ type: 'bet', amount: 750 });
console.log(pokerGame.pot);
