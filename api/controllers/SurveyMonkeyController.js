/**
 * SurveyMonkeyController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var request = require('request');

module.exports = {

	getResponses: function (req, res, next) {

		var respondents = [],
				Survey = sails.config.survey,
				SurveyMonkey = sails.config.survey_monkey_api;

		var options = {
		  url: 'https://api.surveymonkey.net/v2/surveys/get_respondent_list?api_key=' + SurveyMonkey.key,
		  method: 'POST',
		  json: {
		  	"survey_id": "52773801"
		  },
		  headers: {
		  	'Authorization': SurveyMonkey.auth, 
		    'Content-Type': 'application/json'
		  }
		};

		request(options, function (err, response, body) {
			_.forEach(body.data.respondents, function (obj) {
				respondents.push(obj.respondent_id);
			});
			afterRespondents();
		});

		function afterRespondents() {
			console.log(respondents);

			var options2 = {
			  url: 'https://api.surveymonkey.net/v2/surveys/get_responses?api_key=' + SurveyMonkey.key,
			  method: 'POST',
			  json: {
			  	"survey_id": "52773801",
			  	"respondent_ids": respondents
			  },
			  headers: {
			  	'Authorization': SurveyMonkey.auth, 
			    'Content-Type': 'application/json'
			  }
			};

			request(options2, function (err, response, body) {
				_.forEach(body.data, function (obj) {
					console.log(JSON.stringify(obj.respondent_id));
					console.log(JSON.stringify(obj.questions));
				});
				afterCallback2();
			});

			function afterCallback2() {
				res.ok();
			}
		}

	}
	
};
