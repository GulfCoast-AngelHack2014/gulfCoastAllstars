/**
 * ProvidersController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var Converter = require("csvtojson").core.Converter;
var fs = require("fs");

module.exports = {
	
	create: function(req, res, next) {
		Providers.create(req.params.all(), function (err, provider) {
			if (err) return next(err);

			res.json(provider);
		});
	},

	csvImport: function(req, res, next) {

		var csvFileName = "./assets/HealthCare.csv";
		var fileStream = fs.createReadStream(csvFileName);
		//new converter instance
		var csvConverter = new Converter({constructResult:true});

		//end_parsed will be emitted once parsing finished
		csvConverter.on("end_parsed",function(jsonObj){
		   res.json(jsonObj); //here is your result json object
		});

		//read from file
		fileStream.pipe(csvConverter);
	}

};
