const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Owner = require('../models/owner');
var async = require('async');
var Pitch = require('../models/pitch');

// Display list of all Owners.
exports.owner_list = function(req, res, next) {

  Owner.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_owners) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('owner_list', { title: 'Owner List', owner_list: list_owners });
    });

};

// Display detail page for a specific Owner.
exports.owner_detail = function(req, res, next) {

    async.parallel({
        owner: function(callback) {
            Owner.findById(req.params.id)
              .exec(callback)
        },
        owners_pitches: function(callback) {
          Pitch.find({ 'owner': req.params.id },'pname')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.owner==null) { // No results.
            var err = new Error('Owner not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('owner_detail', { title: 'Owner Detail', owner: results.owner, owner_pitches: results.owners_pitches } );
    });

};

// Display Owner create form on GET.
exports.owner_create_get = function(req, res, next) {       
    res.render('owner_form', { title: 'Create Owner'});
};

// Handle Owner create on POST.
exports.owner_create_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.')
        .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
    body('year_founded').isLength({ min: 1 }).trim().withMessage('Year must be specified.'),

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('year_founded').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('owner_form', { title: 'Create Owner', owner: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Owner object with escaped and trimmed data.
            var owner = new Owner(
                {
                    name: req.body.name,
                    year_founded: req.body.year_founded
                });
            owner.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new owner record.
                res.redirect(owner.url);
            });
        }
    }
];

// Display Owner delete form on GET.
exports.owner_delete_get = function(req, res, next) {

    async.parallel({
        owner: function(callback) {
            Owner.findById(req.params.id).exec(callback)
        },
        owners_pitches: function(callback) {
          Pitch.find({ 'owner': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.owner==null) { // No results.
            res.redirect('/catalog/owners');
        }
        // Successful, so render.
        res.render('owner_delete', { title: 'Delete Owner', owner: results.owner, owner_pitches: results.owners_pitches } );
    });

};

// Handle Owner delete on POST.
exports.owner_delete_post = function(req, res, next) {

    async.parallel({
        owner: function(callback) {
          Owner.findById(req.body.ownerid).exec(callback)
        },
        owners_pitches: function(callback) {
          Pitch.find({ 'owner': req.body.ownerid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.owners_pitches.length > 0) {
            // Owner has pitches. Render in same way as for GET route.
            res.render('owner_delete', { title: 'Delete Owner', owner: results.owner, owner_pitches: results.owners_pitches } );
            return;
        }
        else {
            // Owner has no pitches. Delete object and redirect to the list of owners.
            Owner.findByIdAndRemove(req.body.ownerid, function deleteOwner(err) {
                if (err) { return next(err); }
                // Success - go to owner list
                res.redirect('/catalog/owners')
            })
        }
    });
};