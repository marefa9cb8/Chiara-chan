var Promise = require('bluebird');
var slack = require('slack');
var config = require('./config.json');

function slackPost(str){
  return new Promise(function(resolve,reject){
    var param = {
      token:config.SlackBotToken,
      channel:config.SlackChannelID,
      text:str
    };
    slack.chat.postMessage(param,function(err,data){
      if(err) reject(err);
      else  resolve(data);
    });
  });
}

