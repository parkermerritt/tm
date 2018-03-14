const Twit = require('twit')
const unique = require('unique-random-array')
const config = require('../config')
const CoinMarketCap = require('coinmarketcap-api')


const param = config.twitterConfig
const randomReply = unique(param.randomReply.split('|'))

const bot = new Twit(config.twitterKeys)
const client = new CoinMarketCap()

// function: tweets back to user who followed
function tweetNow(text) {
  let tweet = {
    status: text
  }

  bot.post('statuses/update', tweet, (err, data, response) => {
    if (err) {
      console.lol('ERROR Reply', err)
    }
    console.lol('SUCCESS: Replied: ', text)
  })
}

// function: replies to user who followed
const reply = event => {
  // get user's twitter handler/screen name
  let screenName = event.source.screen_name

  if (screenName === config.twitterConfig.username) {
    return
  }
  const response = randomReply()
  
  var ticker = client.getTicker({limit: 1, currency: 'bitcoin'}).then(console.log).catch(console.error)
  var price = ticker.price_usd;
  //console.log(price);
  ticker = String(ticker);
  price = String(price);
  console.log(price);
  
  var mapObj = {
     coin:ticker,
     price:price,
    '@${screenName}':screenName
  };
  
  var res = response.replace(/coin|price|@${screenName}'/gi, function(matched){
  return mapObj[matched];
  });
  
  
  //const res = response.replace('${screenName}', screenName)
  
  tweetNow(res)
}


  





module.exports = reply
