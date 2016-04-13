var Promise = require('bluebird');
var slack = require('slack');
var twitter = require('twitter');
var config = require('./config.json');

var bot = new twitter({
  consumer_key  :config.TwitterConsumerKey,
  consumer_secret :config.TwitterConsumerSecret,
  access_token_key  :config.TwitterAccessToken,
  access_token_secret :config.TwitterAccessTokenSecret
});

function slackPost(str){
  return new Promise(function(resolve,reject){
    var param = {
      token :config.SlackBotToken,
      channel :config.SlackChannelID,
      text  :str
    };
    slack.chat.postMessage(param,function(err,data){
      if(err) reject(err);
      else  resolve(data);
    });
  });
}

function getTweetURL(screen_name, id){
  return 'https://twitter.com/' + screen_name + '/status/' + id;
}

bot.stream('user', function(stream){
  stream.on('favorite',function(data){
    if(data.event === 'favorite' 
    && data.source.screen_name === config.TwitterScreenName
    && data.target_object.extended_entities
    ){
      var url = getTweetURL(data.target.screen_name, data.target_object.id_str);
      slackPost(url);
      console.log(data.target_object.extended_entities);
    }
  });
  stream.on('error', function(error){
    var errStr = error;
    slackPost("error");
  });
});


