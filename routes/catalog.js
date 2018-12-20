var express = require('express');
var router = express.Router();

// Require controller modules.
var owner_controller = require('../controllers/ownerController');
var pitch_controller = require('../controllers/pitchController');
var reservation_controller = require('../controllers/reservationController');

/// PITCH ROUTES ///

// GET catalog home page.
router.get('/', pitch_controller.index);

// GET request for creating a pitch. NOTE This must come before routes that display pitch (uses id).
router.get('/pitch/create', pitch_controller.pitch_create_get);

// POST request for creating pitch.
router.post('/pitch/create', pitch_controller.pitch_create_post);

// GET request to delete pitch.
router.get('/pitch/:id/delete', pitch_controller.pitch_delete_get);

// POST request to delete pitch.
router.post('/pitch/:id/delete', pitch_controller.pitch_delete_post);

// GET request to update pitch.
router.get('/pitch/:id/update', pitch_controller.pitch_update_get);

// POST request to update pitch.
router.post('/pitch/:id/update', pitch_controller.pitch_update_post);

// GET request for one pitch.
router.get('/pitch/:id', pitch_controller.pitch_detail);

// GET request for list of all pitch items.
router.get('/pitches', pitch_controller.pitch_list);

/// OWNER ROUTES ///

// GET request for creating owner. NOTE This must come before route for id (i.e. display owner).
router.get('/owner/create', owner_controller.owner_create_get);

// POST request for creating owner.
router.post('/owner/create', owner_controller.owner_create_post);

// GET request to delete owner.
router.get('/owner/:id/delete', owner_controller.owner_delete_get);

// POST request to delete owner.
router.post('/owner/:id/delete', owner_controller.owner_delete_post);

// GET request for one owner.
router.get('/owner/:id', owner_controller.owner_detail);

// GET request for list of all Authors.
router.get('/owners', owner_controller.owner_list);

/// RESERVATION ROUTES ///

// GET request for creating a Reservation. NOTE This must come before route that displays Reservation (uses id).
router.get('/reservation/create', reservation_controller.reservation_create_get);

// POST request for creating Reservation. 
router.post('/reservation/create', reservation_controller.reservation_create_post);

// GET request to delete Reservation.
router.get('/reservation/:id/delete', reservation_controller.reservation_delete_get);

// POST request to delete Reservation.
router.post('/reservation/:id/delete', reservation_controller.reservation_delete_post);

// GET request for one Reservation.
router.get('/reservation/:id', reservation_controller.reservation_detail);

// GET request for list of all Reservation.
router.get('/reservations', reservation_controller.reservation_list);

module.exports = router;