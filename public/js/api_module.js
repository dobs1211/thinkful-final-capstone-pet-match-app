var request = require('request');

var petfinder = {};

var url = 'http://api.petfinder.com/pet.find?key=6d76ac6705f749eb1062fd7d56bd9498&animal=dog&location=';

petfinder.get = function(zipcode, resType, callback){
  
  request(url + zipcode + '&size=' + resType + '&output=full&format=json', function(error, response, body){
  	if (!error && response.statusCode === 200){
  	  var data = JSON.parse(body);
  	  callback(data.petfinder.pets.pet);
  	} else {
  	  console.log(error);
  	}
  });
}

module.exports = petfinder;