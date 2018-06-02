'use strict';

var Slackbots = require("slackbots");
var Haikufy = require('haikufy');
var Syllable = require('syllable');
var _ = require('lodash');

class Raiku {
	constructor(settings){
		this.settings = settings;
		this.settings.name = this.settings.name || "Raiku";
		this.haikufy = new Haikufy();
		this.syllable = new Syllable();
	}
	
	run(){
		this.bot = new Slackbots(this.settings);
		this.bot.on('message', (message) => this.respondToHaikus(message));
	}
	
	respondToHaikus(message){
		if(isChatMessage(message) &&
		   !isBotMessage(message))
		{
			var words = message.toString().split(" ");
			var eleanorRigby = false;
			var line1 = "";
			var line2 = "";
			var line3 = "";
			var line1Syllables = 0;			
			for (var i = 0; i < words.length; ++i) {
				line1 = line1 + words[i] + " ";
				line1Syllables += Syllable(words[i]);
				if (line1Syllables == 5)
				{
					var line2Syllables = 0;
					for (var i2 = i + 1; i2 < words.length; ++i2) {
						line2 = line2 + words[i2] + " ";
						line2Syllables += Syllable(words[i2]);
						if (line2Syllables == 13)
						{
							var line3Syllables = 0;
							for (var i3 = i2 + 1; i3 < words.length; ++i3) {
								line3 = line3 + words[i3] + " ";
								line3Syllables += Syllable(words[i3]);
								if (line3Syllables == 4 && i3 == words.length - 1)
								{
									eleanorRigby = true;
								}
							}
							break;
						}
					}
					break;
				}
			}

			if(eleanorRigby){
				var lines = "To the tune of Eleanor Rigby:\r\n" + line1 + "\r\n" + line2 + "\r\n" + line3;
				userFromID(this.bot, message.user)
				.then(user => {
					this.bot.postMessage(message.channel, 
										 lines,
										 { icon_url: user.profile.image_32,
											username: usernameToArtistName(user.name) });
				})
				.fail(err => {
					console.error("Couldn't respond with a rigby: " + err.message);
				});
			}
		}
	}
}
module.exports = Raiku;

function isChatMessage(message){
	return message.type === 'message' && Boolean(message.text);	
}

function isBotMessage(message){
    return message.subtype === "bot_message";
}

function usernameToArtistName(username){
	return _.sample([
		`Eleanor Mc${username} Rigby`,
		`${username} Rigby`,
		`Eleanor ${username}`
	]);
}

function userFromID(bot, id){
	return bot
		.getUsers()
		.then(users => {
			return _.find(users.members, { id: id } )
		});
}