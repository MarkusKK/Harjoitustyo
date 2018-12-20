var moment = require('moment');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ReservationSchema = new Schema(
  {
    person_team: {type: String, required: true},
    year: {type: String, required: true},
    month: {type: String, required: true},
    day: {type: String, required: true},
    start_time: {type: String, required: true},
    end_time: {type: String, required: true},
    pitch: {type: Schema.Types.ObjectId, ref: 'Pitch', required: true}, //reference to the associated reservation
  }
);

// Virtual for reservation's URL
ReservationSchema
.virtual('url')
.get(function () {
  return '/catalog/reservation/' + this._id;
});

ReservationSchema
.virtual('reservation_date')
.get(function () {
  return this.day + '.' + this.month + '.' + this.year + ', ' + this.start_time + '-' + this.end_time;
});

//Export model
module.exports = mongoose.model('Reservation', ReservationSchema);