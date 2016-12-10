var petfinder = require('./test_api.js');

petfinder.get(function(results) {
  console.log(results);
});