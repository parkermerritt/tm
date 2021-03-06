const Twit = require('twit')
const unique = require('unique-random-array')
const config = require('../config')
const isReply = require('../helpers/isReply')
const CoinMarketCap = require('coinmarketcap-api')


var tweetQueue   = []; 
var fs           = require('fs'); // access to the file system for results JSON
var shuffle      = require('knuth-shuffle').knuthShuffle; // knuth shuffles the corpus
var async        = require('async'); // async module
var path         = require('path'); // node module for handling and transforming file paths
var coin_Names = require(path.join(__dirname, 'coinNames')); // corpus of coin names


const param = config.twitterConfig
const randomReply = unique(param.randomReply.split('|'))

const bot = new Twit(config.twitterKeys)

const client = new CoinMarketCap()
 
client.getTicker().then(console.log).catch(console.error)
client.getGlobal().then(console.log).catch(console.error)


// selects a coin from the corpus for the upcoming coin search
function getName (callback) {
  var coinNames   = coin_Names;
  var shuffledNames = shuffle(coinNames.slice(0));
  // console.log(shuffledNames);
  var pickRandomPhotographerName = Math.floor(Math.random() * shuffledNames.length);
  console.log('*** photographer name index: ' + pickRandomPhotographerName);
  var searchName = coin_Names[pickRandomPhotographerName];
  console.log('*** a coin has been randomly selected from the corpus...');
  console.log('*** searching with the name: ' + searchName + '...');
  callback(null, searchName);
}

// bing image search based on photographer name selected in getName
function searchImage (searchName, callback) {
  var ticker = client.getTicker({limit: 1, currency: 'bitcoin'}).then(console.log).catch(console.error)
  var price = client.getTicker("bitcoin").price_usd();
  console.log(price);
  //Bing.images('Coin Ticker: ' +
  //  searchName, {adult: 'moderate', imageFilters: {size: 'large'}}, // set 'medium' if file size toarge errors
    function (error, response, body) {
      if (error) {
        callback(error, null, null);
        console.log('==========> Error: ');
        console.log(error);
        return;
      } else {
        console.log('*** getting randomly selected image from bing results array...');
        var coin = searchName;
        //var array        = body.d.results; // search results based on 'photography by ' + corpus name
        //var botData      = {photographer, array};
        var price = client.getTicker({limit: 1, currency:'bitcoin'}).price_usd;
        var botData      = {coin, price};

        console.log('*** search was a success! moving the required botData along...');
        // callback(null, botData);
        setTimeout(function () {
          callback(null, botData);
          // console.log(botData);
        }, 5000); // create a delay before processing the botData
      }
    });
}


// process search results for upcoming tweet
function processBotdata (botData, callback) {
  // this test accounts for searchImage, i.e. bing api sometimes returning an empty array;
  if (!botData || !botData.array || !botData.array.length) {
    if (callback(new Error('==========> Error: CoinMarket API returned No search results'))) {
      async.waterfall([
        getName,
        async.retryable([opts = {times: 5, interval: 500}], searchImage),
        async.retryable([opts = {times: 3, interval: 1000}], processBotdata),
        async.retryable([opts = {times: 3, interval: 500}], getImage),
        postTweet.bind(null, tweet)
      ],
      function (error, result) {
        if (error) {
          console.error(error);
          return;
        }
        // console.log(result);
      });
    }
  } else {
    var coin = botData.coin;
    var price        = botData.price;
    var randomIndex  = Math.floor(Math.random() * array.length);
    console.log('*** randomIndex: ' + randomIndex);
    var mediaUrl  = array[randomIndex].MediaUrl;
    console.log('*** mediaUrl: ' + mediaUrl);
    var sourceUrl = array[randomIndex].SourceUrl;
    console.log('*** sourceUrl: ' + sourceUrl);
    var botData   = {photographer, mediaUrl, sourceUrl};
    // writing the results to a file for later use
    fs.readFile('results.json', function (err, data) {
      var json = JSON.parse(data);
      json.push(['search results for ' + photographer + ': ',
                              'mediaUrl: ' + botData.mediaUrl,
                              'sourceUrl: ' + botData.sourceUrl]);

      fs.writeFile('results.json', JSON.stringify(json, null, '\t'));
      console.log('*** botData appended to results.json file...');
    });
    console.log('*** botData has now been processed for upcoming tweet...');
    // callback(null, botData);
    setTimeout(function () {
      callback(null, botData);
      // console.log(botData);
    }, 5000); // again a little breathing room before getImage
  }
}




function postTweet (tweet, botData, callback) {
  console.log('*** ok, time to tweet!');
  if (tweetQueue.length > 0) {
    var newTweet = tweetQueue.shift();
    //var imgBuffer    = botData.imgBuffer;
    //var b64content   = botData.b64content;
    var coin = botData.coin;
    var price = botData.price;
    //var mediaUrl     = botData.mediaUrl;
    //var sourceUrl    = botData.sourceUrl;
    var name         = tweet.user.screen_name;
    var tweetId      = tweet.id_str;

    // array of question prompts that accompany the photo (removed)
      var questions          = config.questions;
      // selects one of the questions for the reply
      var pickRandomQuestion = Math.floor(Math.random() * questions.length);
      var question           = questions[pickRandomQuestion];
      var reply              = '@' + name + ' ' + question + ' ' + 'Coin Ticker: ' + coin + ' Coin Price: ' + price;
      var params             = {
                                status: reply,
                                in_reply_to_status_id: newTweet.tweetId,
                                //media_ids: [mediaIdStr]
                               };
    
    
  
    //T.post('media/upload', { media_data: b64content }, function (err, data, response) {
      bot.post('statuses/update', params, function (err, data, response) {

      //var mediaIdStr         = data.media_id_string;
     
        // array of question prompts that accompany the photo
  
        //Removed
        
        
      if (err) {
        callback(err, null, null);
        console.log('*** Error');
        console.log(err);
        return;
      } else {
        bot.post('statuses/update', params, function (err, data, response) {
        callback(null, data);
          console.log('*** a tweet has been posted!');
        });
      }
    });
  }
}



// initiates the twitter stream
function streamOn (callback) {
  // listening for @mentions for @MarkMyTrades
  var stream = bot.stream('statuses/filter', { track: ['@MarkMyTrades'] });
  console.log('*** stream is now listening for tweets...');
  // run callback when you have a tweet.
  stream.on('tweet', callback);
}

// callback to streamOn
streamOn(function (tweet) {
  // console.log(' ==========> a request has been made: ' + tweet.text);
  var tweetId         = tweet.id_str;
  var name            = tweet.user.screen_name;
  var request         = tweet.text;
  var trigger         = config.trigger;
  var matchesTrigger  = request.match(trigger);
  var notTriggerMatch = !trigger.test(request);
  var photoReply      = tweet.in_reply_to_status_id_str;
  var questionRegEx   = config.questionRegEx;
  var testQuestion    = questionRegEx.test(tweet.text);
  var notRT           = tweet.retweeted_status === undefined;
  tweetQueue.push({
    tweetId
  });
  console.log(tweetQueue);

  if (matchesTrigger && notRT) {
    console.log('*** a request has been made: ' + tweet.text);
    setTimeout(function () {
      async.waterfall([
        getName,
        async.retryable([opts = {times: 5, interval: 500}], searchImage),
        async.retryable([opts = {times: 3, interval: 1000}], processBotdata),
        //async.retryable([opts = {times: 3, interval: 500}], getImage),
        postTweet.bind(null, tweet)
      ],
      function (error, result) {
        if (error) {
          console.error(error);
          return;
        }
        console.log(result);
      });
    }, 36000);
  } else if (notTriggerMatch && !photoReply && notRT) {
    console.log('*** doesn\'t match the trigger: ' + tweet.text);
    setTimeout(function () {
      if (tweetQueue.length > 0) {
        var newTweet = tweetQueue.shift();
        // array of phrases (to hopefully avoid duplicate status errors if multiple attempts)...
        var tryAgainPhrases = config.tryAgainPhrases;
        // selection of one of the tryAgainPhrases for the reply
        var pickRandomPhrase = Math.floor(Math.random() * tryAgainPhrases.length);
        var tryAgain = tryAgainPhrases[pickRandomPhrase];
        // contructs the reply response
        var reply = '@' + name + tryAgain;
        // parameters for posting a tweet
        var params = { status: reply, in_reply_to_status_id: newTweet.tweetId };
        bot.post('statuses/update', params, function (err, data, response) {
          if (err !== undefined) {
            console.log(err);
          } else {
            console.log('*** tweeted: ' + params.status);
               // console.log(data);
          }
        });
      }
    }, 36000);
  } else {
    if (photoReply && testQuestion && !matchesTrigger && notRT) {
      console.log('*** Question Asked: ' + tweet.text);
      setTimeout(function () {
        if (tweetQueue.length > 0) {
          var newTweet = tweetQueue.shift();
          // question affirmations
          var questionResponses = config.questionResponses;
          var pickRandomPhrase = Math.floor(Math.random() * questionResponses.length);
          var affirmations = questionResponses[pickRandomPhrase];
          // contructs the reply response
          var reply = '@' + name + ' ' + affirmations;
          // parameters for posting a tweet
          var params = { status: reply, in_reply_to_status_id: newTweet.tweetId };
          bot.post('statuses/update', params, function (err, data, response) {
            if (err !== undefined) {
              console.log(err);
            } else {
              console.log('*** tweeted: ' + params.status);
                  // console.log(data);
            }
          });
        }
      }, 36000);
    }
  }
});
         