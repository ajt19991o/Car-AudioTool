
const express = require('express');
const router = express.Router();
const { getComponents } = require('../controllers/components.js');

router.get('/', getComponents);

module.exports = router;
