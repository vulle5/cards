import { assert, assertEquals, assertStrictEquals } from "testing/asserts.ts";
import Blinds from "../Blinds.ts";
import FrenchCard from "../FrenchCard.ts";
import PokerGame, { PokerGameParameters } from "../PokerGame.ts";
import PokerPlayer from "../PokerPlayer.ts";

/**
 * Creates a PokerGame instance with the given parameters.
 * By default, the game will have 4 players with 1000 chips each.
 * @param params Parameters for the PokerGame.
 * @returns New PokerGame.
 */
const createPokerGame = (params?: Partial<PokerGameParameters>) => (
  new PokerGame({
    players: [
      new PokerPlayer<FrenchCard>('Player 1', { chips: 1000 }),
      new PokerPlayer<FrenchCard>('Player 2', { chips: 1000 }),
      new PokerPlayer<FrenchCard>('Player 3', { chips: 1000 }),
      new PokerPlayer<FrenchCard>('Player 4', { chips: 1000 }),
    ],
    ...params
  })
);

Deno.test("Dealer is the first in players array", () => {
  const game: PokerGame = createPokerGame();
  assertStrictEquals(game.players.length, 4);
  assertEquals<PokerPlayer<FrenchCard>>(game.players[0], game.dealer);
});

Deno.test("Small blind is second and big blind is third in players array", () => {
  const game: PokerGame = createPokerGame();
  assertStrictEquals(game.players.length, 4);
  assertEquals<PokerPlayer<FrenchCard>>(game.players[1], game.smallBlindPlayer);
  assertEquals<PokerPlayer<FrenchCard>>(game.players[2], game.bigBlindPlayer);
});

Deno.test("start() handles pre-game actions", () => {
  const game: PokerGame = createPokerGame({
    blinds: new Blinds({ smallBlind: 25, bigBlind: 50, ante: 10 }),
  });
  game.start();

  // Game should have 4 players
  assertStrictEquals(game.players.length, 4);

  // Blinds and ante are paid
  assertStrictEquals(game.pot, 95);
  assertStrictEquals(game.dealer.chips, 990);
  assertStrictEquals(game.smallBlindPlayer.chips, 975);
  assertStrictEquals(game.bigBlindPlayer.chips, 950);
  assertStrictEquals(game.players[3].chips, 990);

  // Cards are dealt
  game.players.forEach((player) => {
    assertStrictEquals(player.cards.length, 2);
  });

  // Player in action is the fourth player (player left of big blind)
  assert(game.players[3].inAction);
});