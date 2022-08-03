import Card from './models/Card.ts'
import Deck from './models/Deck.ts'

console.log(Card.random())
console.log(Deck.random(5).shuffle().toString())

const deck = Deck.random(5)

console.log(deck.toString())
console.log(deck.draw()?.toString())
console.log(deck.cards)
