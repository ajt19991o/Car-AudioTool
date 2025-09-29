
const express = require('express');
const router = express.Router();
const { getVehicleData } = require('../controllers/vehicles.js');

router.get('/', getVehicleData);

module.exports = router;
