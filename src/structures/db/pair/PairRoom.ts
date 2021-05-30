import Pair from './Pair'

class PairRoom {
  constructor(public pair: Pair) {}

  get id() {
    return this.pair.roomID
  }
}

export default PairRoom
