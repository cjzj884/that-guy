const ccxt = require('ccxt')
const cc = require('cryptocompare')
const _ = require('lodash')

const model = {
  listExchanges: async () => {
    const ccExchanges = await cc.exchangeList()
    const keys = Object.keys(ccExchanges).map(key => key.toLowerCase())

    return _.intersection(keys, ccxt.exchanges).sort()
  },

  listPairs: async (exchange) => {
    const ex = new ccxt[exchange]()
    const markets = await ex.load_markets()

    return Object.keys(markets).map(market => {
      return {
        fsym: markets[market].base,
        tsym: markets[market].quote
      }
    }).sort((a, b) => {
      const _a = a.fsym + a.tsym
      const _b = b.fsym + b.tsym

      if (_a < _b) return -1
      if (_a > _b) return 1
      return 0
    })
  },

  getPairPrice: async (exchange, fsym, tsym) => {
    return cc.price(fsym, [tsym], {
      exchanges: [exchange]
    })
  }
}

module.exports = model
