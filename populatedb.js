#! /usr/bin/env node

console.log('This script populates some pitches and owners to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Pitch = require('./models/pitch')
var Owner = require('./models/owner')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var owners = []
var pitches = []

function ownerCreate(name, year_founded, cb) {
  
  var owner = new Owner({ name:name , year_founded:year_founded });
       
  owner.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Owner: ' + owner);
    owners.push(owner)
    cb(null, owner)
  }  );
}

function pitchCreate(pname, city, street, description, owner, zip_code, cb) {
  pitchdetail = {
    pname: pname, 
    city: city,
    street: street,
    description: description,
    owner: owner,
    zip_code: zip_code
  }
    
  var pitch = new Pitch(pitchdetail);    
  pitch.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Pitch: ' + pitch);
    pitches.push(pitch)
    cb(null, pitch)
  }  );
}

function createOwners(cb) {
    async.parallel([
        function(callback) {
          ownerCreate('FC Pallo', '1965', callback);
        },
        function(callback) {
          ownerCreate('FC Teräsmiehet', '1986', callback);
        },
        function(callback) {
          ownerCreate('Voimamiehet', '1955', callback);
        },
        function(callback) {
          ownerCreate('Vauhtiveikot', '2002', callback);
        },
        function(callback) {
          ownerCreate('FC Vauhti', '1999', callback);
        },
        ],
        // optional callback
        cb);
}


function createPitches(cb) {
    async.parallel([
        function(callback) {
          pitchCreate('Kisapuisto', 'Joensuu', 'Kisakatu', 'Firm ground, Small, Low capacity', owners[0], '53253', callback);
        },
        function(callback) {
          pitchCreate('Pelihalli', 'Lappeenranta', 'Pelikatu', 'Firm ground, Big, High capacity', owners[1], '43932', callback);
        },
        function(callback) {
          pitchCreate('Nokia-areena', 'Helsinki', 'Stadiontie', 'Soft ground, Small, Low capacity', owners[2], '86293', callback);
        },
        function(callback) {
          pitchCreate('Pallokenttä', 'Vantaa', 'Jalkapallotie', 'Soft ground, Medium, Medium capacity', owners[3], '43523', callback);
        },
        function(callback) {
          pitchCreate('Oulustadion','Oulu', 'Joulupukintie', 'Artificial ground, Big, High capacity', owners[4], '66334', callback);
        },
        ],
        // optional callback
        cb);
}


async.series([
    createOwners,
    createPitches
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});