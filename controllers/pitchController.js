const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Pitch = require('../models/pitch');
var Owner = require('../models/owner');
var Reservation = require('../models/reservation');
var async = require('async');

exports.index = function(req, res) {   
    
    async.parallel({
        pitch_count: function(callback) {
            Pitch.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        owner_count: function(callback) {
            Owner.countDocuments({}, callback);
        },
        reservation_count: function(callback) {
            Reservation.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all Pitches.
exports.pitch_list = function(req, res, next) {
    Pitch.find({}, 'pname owner')
    .populate('owner')
    .exec(function (err, list_pitches) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('pitch_list', { title: 'Pitch List', pitch_list: list_pitches });
    });
};

// Display detail page for a specific pitch.
exports.pitch_detail = function(req, res, next) {

    async.parallel({
        pitch: function(callback) {

            Pitch.findById(req.params.id)
              .populate('owner')
              .exec(callback);
        },
        reservation: function(callback) {

          Reservation.find({ 'pitch': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.pitch==null) { // No results.
            var err = new Error('Pitch not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('pitch_detail', { title: 'Title', pitch: results.pitch } );
    });

};

// Display pitch create form on GET.
exports.pitch_create_get = function(req, res, next) { 
      
    // Get all pitches, which we can use for adding to our pitch.
    async.parallel({
        owners: function(callback) {
            Owner.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('pitch_form', {title: 'Create Pitch', owners: results.owners });
    });
    
};

// Handle pitch create on POST.
exports.pitch_create_post = [

    // Validate fields.
    body('pname', 'Name must not be empty.').isLength({ min: 1 }).trim(),
    body('owner', 'Owner must not be empty.').isLength({ min: 1 }).trim(),
    body('description', 'Description must not be empty.').isLength({ min: 1 }).trim(),
    body('city', 'City must not be empty.').isLength({ min: 1 }).trim(),
    body('street', 'Street must not be empty.').isLength({ min: 1 }).trim(),
    body('zip_code', 'Postal code must not be empty.').isLength({ min: 1 }).trim(),
  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Pitch object with escaped and trimmed data.
        var pitch = new Pitch(
          { pname: req.body.pname,
            city: req.body.city,
            street: req.body.street,
            zip_code: req.body.zip_code,
            owner: req.body.owner,
            description: req.body.description,
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                owners: function(callback) {
                    Owner.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('pitch_form', { title: 'Create Pitch',owners:results.owners, pitch: pitch, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save pitch.
            pitch.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new pitch record.
                   res.redirect(pitch.url);
                });
        }
    }
];

// Display Pitch delete form on GET.
exports.pitch_delete_get = function(req, res, next) {

    async.parallel({
        pitch: function(callback) {
            Pitch.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.pitch==null) { // No results.
            res.redirect('/catalog/pitches');
        }
        // Successful, so render.
        res.render('pitch_delete', { title: 'Delete Pitch', pitch: results.pitch } );
    });

};

// Handle Pitch delete on POST.
exports.pitch_delete_post = function(req, res, next) {

    async.parallel({
        pitch: function(callback) {
          Pitch.findById(req.body.pitchid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
            // Delete object and redirect to the list of pitches.
            Pitch.findByIdAndRemove(req.body.pitchid, function deletePitch(err) {
                if (err) { return next(err); }
                // Success - go to pitch list
                res.redirect('/catalog/pitches')
            })
    });
};

// Display pitch update form on GET.
exports.pitch_update_get = function(req, res, next) {

    // Get pitch and owners for form.
    async.parallel({
        pitch: function(callback) {
            Pitch.findById(req.params.id).populate('owner').exec(callback);
        },
        owners: function(callback) {
            Owner.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.pitch==null) { // No results.
                var err = new Error('Pitch not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('pitch_form', { title: 'Update Pitch', owners:results.owners, pitch: results.pitch });
        });

};

// Handle pitch update on POST.
exports.pitch_update_post = [
   
    // Validate fields.
    body('pname', 'Name must not be empty.').isLength({ min: 1 }).trim(),
    body('city', 'City must not be empty.').isLength({ min: 1 }).trim(),
    body('street', 'Street must not be empty.').isLength({ min: 1 }).trim(),
    body('description', 'Description must not be empty.').isLength({ min: 1 }).trim(),
    body('owner', 'Owner must not be empty.').isLength({ min: 1 }).trim(),
    body('zip_code', 'Zip_code must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('pname').trim().escape(),
    sanitizeBody('city').trim().escape(),
    sanitizeBody('street').trim().escape(),
    sanitizeBody('description').trim().escape(),
    sanitizeBody('owner').trim().escape(),
    sanitizeBody('zip_code').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Pitch object with escaped/trimmed data and old id.
        var pitch = new Pitch(
          { pname: req.body.name,
            city: req.body.city,
            street: req.body.street,
            owner: req.body.owner,
            description: req.body.description,
            zip_code: req.body.zip_code,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors for form.
            async.parallel({
                owners: function(callback) {
                    Owner.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('pitch_form', { title: 'Update Pitch',owners:results.owners, pitch: pitch, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Pitch.findByIdAndUpdate(req.params.id, pitch, {}, function (err,thepitch) {
                if (err) { return next(err); }
                   // Successful - redirect to pitch detail page.
                   res.redirect(thepitch.url);
                });
        }
    }
];