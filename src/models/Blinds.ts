class Blinds {
  smallBlind: number;
  bigBlind: number;
  ante: number;

  constructor({
    smallBlind = 0,
    bigBlind = 0,
    ante = 0,
  }: BlindsParameters = {}) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.ante = ante;
  }
}

interface BlindsParameters {
  smallBlind?: number;
  bigBlind?: number;
  ante?: number;
}

export default Blinds;
