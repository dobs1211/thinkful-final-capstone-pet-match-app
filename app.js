var express        = require('express');
var session        = require('express-session');
var cookieParser   = require('cookie-parser');
var flash          = require('connect-flash');
var app            = express();
var bodyParser     = require('body-parser');
var request        = require('request');
var bcrypt         = require('bcrypt');
var connect        = require('connect');
var methodOverride = require('method-override');

var authenticateUser = function(email, password, callback) {
  db.collection('users').findOne({email: email}, function(err, data) {
    if (err) {throw err;}
    if (data) {
      bcrypt.compare(password, data.password, function(err, passwordsMatch) {
        if (passwordsMatch) {
        callback(data);
        } else {
        callback(false);
        }
      });
    } else {
      // no user with that email
      callback(false);
    }

  });
};

// Configuration
app.use(cookieParser('shhhhh'));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));



// Setup Database
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var MongoStore = require('connect-mongo')(session);
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/dogAppDb';
var db;

MongoClient.connect(mongoUrl, function (err, database){
  if (err) {
  	console.log(err);
  }
  console.log('Connected!');
  db = database;

  process.on('exit', db.close);
})

//Setup Session
app.use(session({cookie: {}, store: new MongoStore({ url: mongoUrl })}));

// Routes

app.get('/', function(req, res){
  res.render('index', { message: req.flash('error') });
});

app.post('/', function(req, res){
  var zipcode = req.body.zipcode;
  var residenceType = req.body.residenceType;
  var petfinder = require('./petfinder_module.js');
  //var petfinder = require('./js/api_module.js');
  
  if (residenceType === 'apartment'){
  	var size = 'S';
  } else if (residenceType === 'apartment-w-dogrun' || residenceType === 'condo') {
  	var size = 'M';
  } else if (residenceType === 'townhouse' || residenceType === 'single-fam-home') {
  	var size = 'L';
  } else if (residenceType === 'single-fam-home-w-yard'){
  	var size = 'XL';
  }
  
  if (residenceType === 'apartment'){
  	var size = 'S';
  } else if (residenceType === 'apartment-w-dogrun' || residenceType === 'condo') {
  	var size = 'M';
  } else if (residenceType === 'townhouse' || residenceType === 'single-fam-home') {
  	var size = 'L';
  } else if (residenceType === 'single-fam-home-w-yard'){
  	var size = 'XL';
  }

  petfinder.get(zipcode, size, function(results) {
    res.json(results);
  });
});

app.post('/login', function(req, res) {
  if (req.body.email === "" || req.body.password === ""){
    req.flash('error', 'Oops, something\'s wrong! Please make sure to enter your correct email and password.');
    res.redirect('/');
  }
  else {
    authenticateUser(req.body.email, req.body.password, function(user){
      if (user){
        req.session.name = user.name;
        req.session.userId = user._id;
        res.redirect('/user_dash');
      } else {
        req.flash('error', 'Oops, something\'s wrong! Please make sure to enter your correct email and password.');
        res.redirect('/');
      }
    });
  }
});

app.post('/users', function(req, res){
  if (req.body.name === "" || req.body.email === "" || req.body.password === "" || req.body.password_confirm === "") {
    req.flash('error', 'Oops, something\'s wrong! Make sure to enter all fields!');
    res.redirect('/');
  } else if (req.body.password.length > 7 && req.body.password === req.body.password_confirm) {

    var password = bcrypt.hashSync(req.body.password, 8);
    var email = req.body.email;
    var name = req.body.name;

    db.collection('users').findOne({email: email}, function(err, user) {
      if (user) {
        req.flash('error', 'Oops, something\'s wrong! That email is already in use!');
        res.redirect('/');
      } else {
      db.collection('users').insert({name: name, password: password, email: email, fav_dogs: []}, function(err){
        if (!err) {
          console.log('success');
        }
      });
      db.collection('users').findOne({email: email}, function(err, user) {
        req.session.name = user.name;
        req.session.userId = user._id;
        res.redirect('/user_dash');
      });
      }
    })
  } else if (req.body.password.length < 8) {
    req.flash('error', 'Oops, something\'s wrong! Please make sure your password is at least 8 characters.');
    res.redirect('/');
  } else if (req.body.password !== req.body.password_confirm) {
    req.flash('error', 'Your passwords don\'t match! Try again!');
    res.redirect('/');
  }
});

app.get('/user_dash', function(req, res){
  var id = req.session.userId;
  if (id) {
    db.collection('users').findOne({_id: ObjectId(id)}, function(err, data) { 
    console.log(data.fav_dogs)
    res.render('user_dash', { name: data.name, email: data.email, id: data._id, fav_dogs: data.fav_dogs, message: req.flash('error') });
    });
  } else {
    res.redirect('/');
  }
});

app.get('/user_dash/profile', function(req, res){
  var id = req.session.userId;
  db.collection('users').findOne( {_id: ObjectId(id)}, function(err, result){
    res.json(result);
  })
});

app.get('/user_dash/fav_dogs', function(req, res){
  var id = req.session.userId;
  db.collection('users').findOne( {_id: ObjectId(id)}, function(err, result){
    res.json(result);
  })
});

app.patch('/users/:id', function(req, res){
  var id = req.params.id;
  if (req.body.password.length > 7 && req.body.password === req.body.password_confirm) {
    var password = bcrypt.hashSync(req.body.password, 8);
    db.collection('users').update({_id: ObjectId(id)}, {$set: {name: req.body.name, password: password, email: req.body.email}}, function(err, result){
      if (!err){
        console.log(result);
      }
    });
  } else if (req.body.password.length < 8) {
    req.flash('error', 'Oops, something\'s wrong! Please make sure your password is at least 8 characters.');
    res.redirect('/user_dash');
  } else if (req.body.password !== req.body.password_confirm) {
    req.flash('error', 'Your passwords don\'t match! Try again!');
    res.redirect('/user_dash');
  } else if (req.body.name === "" || req.body.email === "" || req.body.password === "" || req.body.password_confirm === "") {
    req.flash('error', 'Oops, something\'s wrong! Make sure to enter all fields!');
    res.redirect('/user_dash');
  }
  res.redirect('/user_dash');
});

app.delete('/users/:id', function(req, res){
  var id = req.params.id
  db.collection('users').remove({_id: ObjectId(id)}, function(err, result){
    if (err) {
      throw err;
    } else {
      req.session.name = null;
      req.session.userId = null;
      res.json({ success: true });
    }
  })
})

app.patch('/users/:id/fav_dogs', function(req, res){
  var id = req.params.id;
  db.collection('users').update({_id: ObjectId(id)}, {$addToSet: {fav_dogs: {name: req.body.name.$t, pic: req.body.media.photos.photo[2].$t, age: req.body.age.$t, breed: req.body.breeds.breed, contact: req.body.contact.email.$t, petfinder_id: req.body.id.$t, info: req.body.description.$t}}}, function (err, result){
    if (!err) {
      res.json({ success: true });
    }
  })
});

app.delete('/users/:id/fav_dogs/:dogId', function(req, res){
  var id = req.params.id;
  console.log(req.body.petfinder_id);
  var dogId = req.params.dogId;
  db.collection('users').update({_id: ObjectId(id)}, {$pull: {fav_dogs: {petfinder_id: dogId}}}, function (err, result){
    if (!err) {
      res.json({ success: true });
    }
  })
})

app.get('/logout', function(req, res) {
  req.session.name = null;
  req.session.userId = null;
  res.redirect('/');
});

app.listen(process.env.PORT || 3000);
