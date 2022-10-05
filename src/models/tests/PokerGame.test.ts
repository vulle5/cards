import { assertEquals, AssertionError, assertStrictEquals, assertThrows } from "testing/asserts.ts";
import Blinds from "../Blinds.ts";
import FrenchCard from "../FrenchCard.ts";
import PokerGame, { ActionType, PokerGameParameters } from "../PokerGame.ts";
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

Deno.test('PokerGame - constructor', async (t) => {
  const pokerGame = createPokerGame({
    blinds: new Blinds({ smallBlind: 25, bigBlind: 50, ante: 10 }),
    maxPlayers: 5,
  });
  assertStrictEquals(pokerGame.players.length, 4);
  assertStrictEquals(pokerGame.blinds.smallBlind, 25);
  assertStrictEquals(pokerGame.blinds.bigBlind, 50);
  assertStrictEquals(pokerGame.blinds.ante, 10);
  assertStrictEquals(pokerGame.handSize, 2);
  assertStrictEquals(pokerGame.cardRanks.length, 13);
  assertStrictEquals(pokerGame.deck.cards.length, 52);
  assertStrictEquals(pokerGame.minBet, 0);
  assertStrictEquals(pokerGame.maxPlayers, 5);

  await t.step('does not allow game', async (t) => {
    await t.step('with max players less than 2', () => {
      assertThrows(() => createPokerGame({ maxPlayers: 1 }));
    });

    await t.step('with less than two players', () => {
      assertThrows(() => createPokerGame({ players: [] }));
      assertThrows(() =>
        createPokerGame({
          players: [new PokerPlayer<FrenchCard>("Player 1", { chips: 1000 })],
        }),
        AssertionError,
        "Must have at least 2 players."
      );
    });

    await t.step("with too many players", () => {
      assertThrows(() =>
        createPokerGame({
          players: [
            new PokerPlayer<FrenchCard>("Player 1", { chips: 1000 }),
            new PokerPlayer<FrenchCard>("Player 2", { chips: 1000 }),
            new PokerPlayer<FrenchCard>("Player 3", { chips: 1000 }),
          ],
          maxPlayers: 2,
        }),
        AssertionError,
        "Too many players. Max is 2."
      );
    });
  })
});

Deno.test("In game with more than 2 players", async (t) => {
  await t.step('with 3 players', async (t) => {
    const pokerGame: PokerGame = createPokerGame({
      players: [
        new PokerPlayer<FrenchCard>('Player 1', { chips: 1000 }),
        new PokerPlayer<FrenchCard>('Player 2', { chips: 1000 }),
        new PokerPlayer<FrenchCard>('Player 3', { chips: 1000 }),
      ]
    });
    assertStrictEquals(pokerGame.players.length, 3);

    await t.step('dealer is last in the players array', () => {
      assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[2], pokerGame.dealer);
    })
  
    await t.step('small blind player is second last', () => {
      assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[1], pokerGame.smallBlindPlayer);
    })
  
    await t.step('big blind player is third last', () => {
      assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[0], pokerGame.bigBlindPlayer);
    })
  })

  await t.step('with 4 or more players', async (t) => {
    const pokerGame: PokerGame = createPokerGame();
    assertStrictEquals(pokerGame.players.length, 4);

    await t.step('dealer is last in the players array', () => {
      assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[3], pokerGame.dealer);
    })
  
    await t.step('small blind player is second last', () => {
      assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[2], pokerGame.smallBlindPlayer);
    })
  
    await t.step('big blind player is third last', () => {
      assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[1], pokerGame.bigBlindPlayer);
    })
  })
});

Deno.test('In game with 2 players', async (t) => {
  const pokerGame: PokerGame = createPokerGame({
    players: [
      new PokerPlayer<FrenchCard>('Player 1', { chips: 1000 }),
      new PokerPlayer<FrenchCard>('Player 2', { chips: 1000 }),
    ]
  });
  assertStrictEquals(pokerGame.players.length, 2);

  await t.step('dealer is last in the players array', () => {
    assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[1], pokerGame.dealer);
  })

  await t.step('small blind player is the dealer', () => {
    assertEquals<PokerPlayer<FrenchCard>>(pokerGame.dealer, pokerGame.smallBlindPlayer);
  })

  await t.step('big blind is the first player', () => {
    assertEquals<PokerPlayer<FrenchCard>>(pokerGame.players[0], pokerGame.bigBlindPlayer);
  })
})

Deno.test("start() handles pre-game actions", () => {
  const pokerGame: PokerGame = createPokerGame({
    blinds: new Blinds({ smallBlind: 25, bigBlind: 50, ante: 10 }),
  });
  pokerGame.start();

  // Game should have 4 players
  assertStrictEquals(pokerGame.players.length, 4);

  // Blinds and ante are paid
  assertStrictEquals(pokerGame.pot, 115);
  assertStrictEquals(pokerGame.dealer.chips, 990);
  assertStrictEquals(pokerGame.smallBlindPlayer.chips, 965);
  assertStrictEquals(pokerGame.bigBlindPlayer.chips, 940);
  assertStrictEquals(pokerGame.players[3].chips, 990);

  // Cards are dealt
  pokerGame.players.forEach((player) => {
    assertStrictEquals(player.cards.length, 2);
  });

  // Player in action is the first player
  assertStrictEquals(pokerGame.players[0].inAction, true);
});

Deno.test("act() handles bet action", () => {
  const pokerGame: PokerGame = createPokerGame();
  pokerGame.start();

  pokerGame.act({ type: ActionType.Bet, amount: 100 }); // Player 1
  pokerGame.act({ type: ActionType.Bet, amount: 200 }); // Player 2
  pokerGame.act({ type: ActionType.Bet, amount: 300 }); // Player 3
  pokerGame.act({ type: ActionType.Bet, amount: 1100 }); // Player 4

  assertStrictEquals(pokerGame.players[0].chips, 900);
  assertStrictEquals(pokerGame.players[1].chips, 800);
  assertStrictEquals(pokerGame.players[2].chips, 700);
  assertStrictEquals(pokerGame.players[3].chips, 0);
});

Deno.test("act() handles player switching", () => {
  const pokerGame: PokerGame = createPokerGame();
  pokerGame.start();

  assertStrictEquals(pokerGame.players[0].inAction, true);
  pokerGame.act({ type: ActionType.Bet, amount: 100 });
  assertStrictEquals(pokerGame.players[0].inAction, false);

  assertStrictEquals(pokerGame.players[1].inAction, true);
  pokerGame.act({ type: ActionType.Bet, amount: 100 });
  assertStrictEquals(pokerGame.players[1].inAction, false);
  assertStrictEquals(pokerGame.players[2].inAction, true);
});
