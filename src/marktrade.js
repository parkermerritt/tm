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


// initiates the twitter stream
function streamOn (callback) {
  // listening for @mentions for @askthephoto
  var stream = T.stream('statuses/filter', { track: ['@askthephoto'] });
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
        async.retryable([opts = {times: 3, interval: 500}], getImage),
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
         