const Twit = require('twit')
const unique = require('unique-random-array')
const config = require('../config')
const CoinMarketCap = require('coinmarketcap-api')


const param = config.twitterConfig
const randomReply = unique(param.randomReply.split('|'))

const bot = new Twit(config.twitterKeys)
const client = new CoinMarketCap()

console.log(client)

async function getPriceInfo() {
  let ticker; 
  try {
  ticker = await client.getTicker({limit: 1, currency: 'bitcoin'}).then(console.log).catch(console.error); 
  } catch (e) {
    ticker = await client.getTicker({limit: 1, currency: 'bitcoin'}).then(console.log).catch(console.error); 
  }
  return ticker[price_usd]
}
    //}


var price = ticker['price_USD'];
console.log(price);



client.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var myArr = JSON.parse(this.responseText);
        document.getElementById("bitcoin").innerHTML = myArr[0];
    }
};

//var price = ticker.getTicker("GET", "price_USD", true);
//console.log(price)

//price.then(function(result) {
//   console.log(result) //will log results.
//})

//client.send();

//var data = JSON.parse(ticker);
//console.log(data)
//var price = ticker[0]['price_usd'];


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
  
  ticker.then(function(result) {
   //console.log(result) //will log results.
})
  
  //var price = ticker[0]['price_usd'];
  //console.log(price);
  //console.log(ticker);
  //console.log(price);
  
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
