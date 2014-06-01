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
				survey_responses = [],
				parsed_response = {},
				json_export = [];
				Survey = sails.config.survey,
				SurveyMonkey = sails.config.survey_monkey_api;

		var respondentRequest = {
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

		request(respondentRequest, function (err, response, body) {
			_.forEach(body.data.respondents, function (obj) {
				respondents.push(obj.respondent_id);
			});
			afterRespondents();
		});

		function afterRespondents() {

			var responseRequest = {
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

			request(responseRequest, function (err, response, body) {
				_.forEach(body.data, function (obj) {
					survey_responses.push(obj);
				});
				afterResponses();
			});

			function afterResponses() {

				_.forEach(survey_responses, function (unique_response) {
					// console.log("Unique Response: " + JSON.stringify(unique_response));

					var responses = _.clone(Survey, true);
					// console.log("Cloned: " + JSON.stringify(responses));

					_.forEach(responses.responses, function (obj) {
						// console.log("Response: " + JSON.stringify(obj));
						var q_answer = _.find(unique_response.questions, { 'question_id': obj.question_id
						});
						// console.log("Q_Answer: " + JSON.stringify(q_answer));
						if(obj.single_select) {
							_.forEach(obj.response, function (option) {
								if(option.row != '7631874783') {
									parsed_response.q_gender = "Female";
								} else {
									parsed_response.q_gender = "Male";
								}
							});
						} else if(obj.demographic) {
							_.forEach(obj.response, function (addr) {
								addr_obj = _.find(q_answer.answers, { 'row': addr.row });
								parsed_response['q_' + addr.label] = addr_obj.text;
							});
						} else if(obj.multiple_choice) {
							_.forEach(obj.response, function (option) {
								health_obj = _.find(q_answer.answers, { 'row': option.row });
								if(health_obj) {
									parsed_response['q_' + option.label] = 1;
								} else {
									parsed_response['q_' + option.label] = 0;
								}	
							});
						} else {
							parsed_response['q_' + obj.question] = q_answer.answers[0].text;
						}
					});
					
					console.log("Parsed: " + JSON.stringify(parsed_response));
					json_export.push(_.clone(parsed_response));
				});

				// console.log(JSON.stringify(parsed_response));
				res.json(json_export);
			}
		}
	}
	
};
