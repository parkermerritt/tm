const Twit = require('twit')
const unique = require('unique-random-array')
const config = require('../config')
const CoinMarketCap = require('coinmarketcap-api')


const param = config.twitterConfig
const randomReply = unique(param.randomReply.split('|'))

const bot = new Twit(config.twitterKeys)
const client = new CoinMarketCap()


// CoinMarketCap info search based on coin name selected in getName
function searchImage (searchName, callback) {
  var ticker = client.getTicker({limit: 1, currency: 'bitcoin'}).then(console.log).catch(console.error)
  var price = client.getTicker("bitcoin").price_usd;
  console.log(price);
  
        var coin = searchName;
        var price = client.getTicker({limit: 1, currency:'bitcoin'}).price_usd;
        var botData      = {coin, price};

        console.log('*** search was a success! moving the required botData along...');
        // callback(null, botData);
        setTimeout(function () {
          callback(null, botData);
          // console.log(botData);
        }, 5000); // create a delay before processing the botData
      }
    


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
  var price = client.getTicker("bitcoin").price_usd;
  console.log(price);
  
  var mapObj = {
     coin:ticker,
     price:price,
    '${screenName}':screenName
  };
  
  str = response.replace(/coin|price|${screenName}'/gi, function(matched){
  return mapObj[matched];
  });

  const res = str.replace('${screenName}', screenName)

  tweetNow(res)
}
