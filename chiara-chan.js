var Promise = require('bluebird');
var https = require('https');
var fs = require('fs');
var path = require('path');
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

function downloadImg(url){
  return new Promise(function(resolve,reject){
    var filenName = path.basename(url);
    var outFile = fs.createWriteStream(config.SaveImgDir + filenName);
    var req = https.get(url, function(res){
      res.pipe(outFile);
      res.on('end', function(){
        outFile.close();
        resolve();
      });
    });
    req.on('error', function(err){
      reject(err);
    });
  });
}

bot.stream('user', function(stream){
  stream.on('favorite',function(data){
    if(data.event === 'favorite' 
    && data.source.screen_name === config.TwitterScreenName
    && data.target_object.extended_entities
    ){
      var url = getTweetURL(data.target.screen_name, data.target_object.id_str);
      //slackPost(url);
      data.target_object.extended_entities.media.forEach(function(value){
        console.log(value.media_url_https);
        downloadImg(value.media_url_https);
      });
    }
  });
  stream.on('error', function(error){
    var errStr = error;
    slackPost("error");
  });
});


