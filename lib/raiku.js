'use strict';

var Slackbots = require("slackbots");
var Haikufy = require('haikufy');
var Syllable = require('syllable');
var SyllaRhyme = require( 'syllarhyme' );
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
			let haiku = this.haikufy.find(message.text);
            if(haiku){
                userFromID(this.bot, message.user)
                .then(user => {
                    this.bot.postMessage(message.channel, 
                                         haiku.join('\n'),
                                         { icon_url: user.profile.image_32,
                                            username: usernameToArtistName(user.name) });
                })
                .fail(err => {
                    console.error("Couldn't respond with a haiku: " + err.message);
                    console.error("Couldn't respond with a rigby: " + err.message);
                });
            } else {
				var words = message.text.split(" ");
				var eleanorRigby = false;
				var backdoor = false;
				if (message.text == "Eleanor Rigby")
				{
					eleanorRigby = true;
					backdoor = true;
				}
				
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
									var lastWordOnLineTwo = words[i2];
									var lastWordOnLineThree = words[i3];    
									if ((line3Syllables == 4 || line3Syllables == 5) && i3 == words.length - 1) {
										var theyRhyme = false;
										var bot = this.bot;
										SyllaRhyme(function(sr){
											theyRhyme = sr.rhymesWith( lastWordOnLineTwo, lastWordOnLineThree );
											if (theyRhyme)
											{
												var lines = "To the tune of Eleanor Rigby:\r\n" + line1 + "\r\n" + line2 + "\r\n" + line3;
												if (backdoor) {
													line1 = "Eleanor Rigby,";
													line2 = "picks up the rice In the church where a wedding has been";
													line3 = "lives in a dream";
												}
												userFromID(bot, message.user)
												.then(user => {
													bot.postMessage(message.channel, 
																	lines,
																	{ icon_url: user.profile.image_32,
																		username: usernameToRigbyName(user.name) });
												})
												.fail(err => {
													console.error("Couldn't respond with a rigby: " + err.message);
												});
											}
										});
										break;
									}
								}
								break;
							}
						}
						break;
					}
				}
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
		`The artist formerly known as ${username}`,
        `${username}son`,
        `The great ${username}`,
        `${username} Allan Poe`,
        `${username} Shakespeare`,
        `${username} Wordsmith`,
        `${username} E. Cummings`
	]);
}

function usernameToRigbyName(username){
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