const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Reservation = require('../models/reservation');
var Pitch = require('../models/pitch');
var async = require('async');

// Display list of all reservations.
exports.reservation_list = function(req, res, next) {
  
    Reservation.find()
    .populate('pitch')
    .exec(function (err, list_reservations) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('reservation_list', { title: 'Reservation List', reservation_list: list_reservations });
    });
    
};

// Display detail page for a specific Reservation.
exports.reservation_detail = function(req, res, next) {

    Reservation.findById(req.params.id)
    .populate('pitch')
    .exec(function (err, reservation) {
      if (err) { return next(err); }
      if (reservation==null) { // No results.
          var err = new Error('Reservation not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('reservation_detail', { title: 'Reservation:', reservation:  reservation});
    })

};

// Display Reservation create form on GET.
exports.reservation_create_get = function(req, res, next) {       

    Pitch.find({},'pname')
    .exec(function (err, pitches) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('reservation_form', {title: 'Create Reservation', pitch_list:pitches});
    });
    
};

// Handle Reservation create on POST.
exports.reservation_create_post = [

    // Validate fields.
    body('pitch', 'Pitch must be specified').isLength({ min: 1 }).trim(),
    body('person_team', 'Person/team must be specified').isLength({ min: 1 }).trim(),
    body('year', 'Invalid year').isLength({ min: 1 }).trim(),
    body('month', 'Invalid month').isLength({ min: 1 }).trim(),
    body('day', 'Invalid day').isLength({ min: 1 }).trim(),
    body('start_time', 'Invalid time').isLength({ min: 1 }).trim(),
    body('end_time', 'Invalid time').isLength({ min: 1 }).trim(),
    
    // Sanitize fields.
    sanitizeBody('pitch').trim().escape(),
    sanitizeBody('person_team').trim().escape(),
    sanitizeBody('year').trim().escape(),
    sanitizeBody('month').trim().escape(),
    sanitizeBody('day').trim().escape(),
    sanitizeBody('start_time').trim().escape(),
    sanitizeBody('end/time').trim().escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Reservation object with escaped and trimmed data.
        var reservation = new Reservation(
          { pitch: req.body.pitch,
            person_team: req.body.person_team,
            year: req.body.year,
            month: req.body.month,
            day: req.body.day,
            start_time: req.body.start_time,
            end_time: req.body.end_time
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Pitch.find({},'title')
                .exec(function (err, pitches) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('reservation_form', { title: 'Create Reservation', pitch_list : pitches, selected_pitch : reservation.pitch._id , errors: errors.array(), reservation:reservation });
            });
            return;
        }
        else {
            // Data from form is valid.
            reservation.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(reservation.url);
                });
        }
    }
];

// Display Reservation delete form on GET.
exports.reservation_delete_get = function(req, res, next) {

    async.parallel({
        reservation: function(callback) {
            Reservation.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation==null) { // No results.
            res.redirect('/catalog/reservations');
        }
        // Successful, so render.
        res.render('reservation_delete', { title: 'Delete Reservation', reservation: results.reservation } );
    });

};

// Handle Reservation delete on POST.
exports.reservation_delete_post = function(req, res, next) {

    async.parallel({
        reservation: function(callback) {
          Reservation.findById(req.body.reservationid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
            // Delete object and redirect to the list of reservations.
            Reservation.findByIdAndRemove(req.body.reservationid, function deleteReservation(err) {
                if (err) { return next(err); }
                // Success - go to reservation list
                res.redirect('/catalog/reservations')
            })
    });
};