var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OwnerSchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    year_founded: {type: String},
  }
);

// Virtual for owner's URL
OwnerSchema
.virtual('url')
.get(function () {
  return '/catalog/owner/' + this._id;
});

//Export model
module.exports = mongoose.model('Owner', OwnerSchema);