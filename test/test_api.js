var request = require('request');

var petfinder = {};

var url = 'http://api.petfinder.com/pet.find?key=6d76ac6705f749eb1062fd7d56bd9498&animal=dog&location=07716&output=full&format=json';

petfinder.get = function(callback){
  
  request(url, function(error, response, body){
  	if (!error && response.statusCode === 200){
  	  var data = JSON.parse(body);
  	  callback(data.petfinder.pets.pet);
  	} else {
  	  console.log(error);
  	}
  });
}

module.exports = petfinder;