const express = require('express');
const router = express.Router();
const { getMakeOverview, getVehicleSpecs } = require('../controllers/specs.js');

router.get('/:make/:model', getVehicleSpecs);
router.get('/:make', getMakeOverview);

module.exports = router;
