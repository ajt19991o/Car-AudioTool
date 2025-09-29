
const express = require('express');
const router = express.Router();
const { getVehicleSpecs } = require('../controllers/specs.js');

router.get('/:make/:model', getVehicleSpecs);

module.exports = router;
