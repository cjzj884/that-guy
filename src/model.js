const path = require('path')
const ccxt = require('ccxt')
const cc = require('cryptocompare')
const _ = require('lodash')
const glob = require('glob-promise')
const moment = require('moment')
const fs = require('fs-extra')
const csv = require('csv-parse/lib/sync')

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
  },

  getHistoricalPrice: async (exchange, fsym, tsym, timestamp, limit) => {
    return cc.histoMinute(fsym, tsym, {
      exchange,
      timestamp,
      limit
    })
  },

  getBackPriceRawData: async (dataPath, exchange, fsym, tsym) => {
    const dataDir = path.join(dataPath, exchange, `${fsym}-${tsym}`)
    const sep = path.sep
    const files = await glob(`${dataDir}${sep}**${sep}*.csv`)

    let data = await Promise.all(files.map(async (file) => {
      const dateString = file.replace(dataDir + sep, '').replace(new RegExp(sep, 'g'), ' ').replace('.csv', '')
      const date = moment(dateString, 'YYYY-MMM-DD')
      const data = await fs.readFile(file)
      return {
        date: date,
        filename: file,
        data: data
      }
    }))
    data.sort((a, b) => a.date.diff(b.date))

    return data
  },

  extractBackPriceFromRaw: async (rawData) => {
    const parsedData = rawData.map(day => {
      return csv(day.data, {columns: true})
    })
    return _.concat.apply(null, parsedData)
  }
}

module.exports = model
