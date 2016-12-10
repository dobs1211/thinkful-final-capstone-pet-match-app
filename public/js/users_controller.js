angular.module('DogAdoptionApp').controller('UsersController', UsersController);

UsersController.$inject = ['$http'];

function UsersController($http){
	
	var ctrl = this;

	ctrl.search = function (){
		console.log('getting...', ctrl.zipcode, ctrl.residenceType);
		$http.post('/', {zipcode: ctrl.zipcode, residenceType: ctrl.residenceType}).then(function(response){
			console.log(response.data);
			ctrl.searchList = response.data;

			ctrl.searchList = ctrl.searchList.map(function(dog) {
				if (Array.isArray(dog.breeds.breed)) {
					dog.breeds.breed = dog.breeds.breed
						.map(function(breedObj) {
							return breedObj.$t;
						})
						.join(', ');
				} else {
					dog.breeds.breed = dog.breeds.breed.$t;
				}
				return dog;
			});
		})
  }

  ctrl.addFavs = function (id, dog){
  	console.log(id, dog);
  	$http.patch('/users/' + id + '/fav_dogs', dog).then(function(data){
      console.log('addFavs callback');
      ctrl.favorites();
  	}, function(err){
      console.log(err);
    });
  }

  ctrl.deleteProfile = function (id){
  	$http.delete('/users/' + id).success(function(data){
  	})
  }

  ctrl.profile = function (){
  	$http.get('/user_dash/profile').then(function(response){
  		ctrl.profileInfo = response.data;
  	});
  }

  ctrl.favorites = function (){
  	$http.get('/user_dash/fav_dogs').then(function(response){
  		ctrl.favDogs = response.data.fav_dogs;
  	});
  }

  ctrl.removeFavs = function(id, dog){
  	$http.delete('/users/' + id + '/fav_dogs/' + dog.petfinder_id, dog).success(function(data){
      ctrl.favorites();
  	})
  }

  ctrl.userChoice = function (choice){
  	ctrl.click = choice;
  }

  ctrl.toggleButtons = function(choice) {
    ctrl.love = !ctrl.love;
  };
  

  ctrl.profile();
  ctrl.favorites();

}