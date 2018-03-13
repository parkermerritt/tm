const Twit = require('twit')
const unique = require('unique-random-array')
const config = require('../config')
const isReply = require('../helpers/isReply')
const CoinMarketCap = require('coinmarketcap-api')

const param = config.twitterConfig
const randomReply = unique(param.randomReply.split('|'))

const bot = new Twit(config.twitterKeys)

const client = new CoinMarketCap()
 
client.getTicker().then(console.log).catch(console.error)
client.getGlobal().then(console.log).catch(console.error)


