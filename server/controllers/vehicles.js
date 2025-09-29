
const fetch = require('node-fetch');

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

const getVehicleData = async (req, res) => {
  // Pre-defined list of major manufacturer IDs for simplicity
  const manufacturers = [
    { id: 987, name: 'Ford Motor Company' },
    { id: 955, name: 'General Motors' },
    { id: 982, name: 'Honda' },
    { id: 959, name: 'Toyota' },
    { id: 988, name: 'Stellantis (Chrysler/FCA)' },
    { id: 992, name: 'Volkswagen Group' },
    { id: 969, name: 'Nissan' },
  ];

  try {
    const promises = manufacturers.map(async (mfr) => {
      const response = await fetch(`${NHTSA_API_BASE}/GetMakesForManufacturer/${mfr.id}?format=json`);
      const data = await response.json();
      return {
        corporation: mfr.name,
        makes: data.Results.map(make => make.Make_Name).filter(name => name),
      };
    });

    const vehicleData = await Promise.all(promises);
    res.json(vehicleData);
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle data' });
  }
};

module.exports = {
  getVehicleData,
};
