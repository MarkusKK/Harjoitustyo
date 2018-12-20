var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PitchSchema = new Schema(
  {
  	pname: {type: String, required: true, max: 100},
    city: {type: String, required: true, max: 100},
    street: {type: String, required: true, max: 100},
    description: {type: String, required: true, max: 100},
    owner: {type: Schema.Types.ObjectId, ref: 'Owner', required: true},
    zip_code: {type: String, required: true, max: 100}
  }
);

// Virtual for pitch's location
PitchSchema
.virtual('location')
.get(function () {
  return this.city + ', ' + this.street + ', ' + this.zip_code;
});

// Virtual for pitch's URL
PitchSchema
.virtual('url')
.get(function () {
  return '/catalog/pitch/' + this._id;
});

//Export model
module.exports = mongoose.model('Pitch', PitchSchema);