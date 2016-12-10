console.log('main is linked');

$(document).ready(function(){

  var $loginDiv = $('#login-show');
  var $loginContainer = $('#container-login');
  var $closeLogin = $('#close-login');

  var $newUserDiv = $('#new-user-show');
  var $newUserContainer = $('#container-new-user');
  var $closeNewUser = $('#close-new-user');

  var $editProfileDiv = $('#edit-profile-show');
  var $editProfileContainer = $('#container-edit-profile');
  var $closeEditProfile = $('#close-edit-profile');

  var $heart = $('.heart');

  var toggleLoginModal = function(container){
    $loginContainer.toggle();
  }

  var toggleNewUserModal = function(container){
    $newUserContainer.toggle();
  }

  var toggleEditProfileModal = function(container){
    $editProfileContainer.toggle();
  }

  var fillHeart = function(){
    $heart.toggleClass('empty');
    $heart.toggleClass('red');
    console.log('clickkk');
  }

  $loginDiv.on('click', toggleLoginModal);
  $closeLogin.on('click', toggleLoginModal);

  $newUserDiv.on('click', toggleNewUserModal);
  $closeNewUser.on('click', toggleNewUserModal);

  $editProfileDiv.on('click', toggleEditProfileModal);
  $closeEditProfile.on('click', toggleEditProfileModal);

  $heart.on('click', fillHeart());
});
