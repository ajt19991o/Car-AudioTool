
const fs = require('fs');
const path = require('path');

const specsFilePath = path.join(__dirname, '../data/vehicle_specs.json');

const getVehicleSpecs = (req, res) => {
  const { make, model } = req.params;

  fs.readFile(specsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading vehicle specs data' });
    }
    
    const allSpecs = JSON.parse(data);
    const specs = allSpecs[make]?.[model];

    if (specs) {
      res.json(specs);
    } else {
      res.status(404).json({ message: 'Specs not found for this vehicle' });
    }
  });
};

module.exports = {
  getVehicleSpecs,
};
