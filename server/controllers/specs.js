const fs = require('fs/promises');
const path = require('path');

const specsFilePath = path.join(__dirname, '../data/vehicle_specs.json');

let cachedSpecs = null;
let cacheLoadedAt = 0;

const readSpecs = async () => {
  if (cachedSpecs && cacheLoadedAt + 1000 * 60 * 10 > Date.now()) {
    return cachedSpecs;
  }
  const raw = await fs.readFile(specsFilePath, 'utf8');
  cachedSpecs = JSON.parse(raw);
  cacheLoadedAt = Date.now();
  return cachedSpecs;
};

const findMakeEntry = (data, makeParam) => {
  const requested = makeParam.toLowerCase();
  const match = Object.keys(data).find((make) => make.toLowerCase() === requested);
  if (!match) return null;
  return { makeLabel: match, models: data[match] };
};

const findModelEntry = (models, modelParam) => {
  const requested = modelParam.toLowerCase();
  const match = Object.keys(models).find((model) => model.toLowerCase() === requested);
  if (!match) return null;
  return { modelLabel: match, details: models[match] };
};

const buildModelOverview = (models) =>
  Object.entries(models).map(([model, details]) => ({
    model,
    years: details.years ?? [],
    trims: details.trims ?? [],
  }));

const getMakeOverview = async (req, res) => {
  try {
    const specs = await readSpecs();
    const makeEntry = findMakeEntry(specs, req.params.make);

    if (!makeEntry) {
      return res.status(404).json({ message: 'Make not found' });
    }

    return res.json({
      make: makeEntry.makeLabel,
      models: buildModelOverview(makeEntry.models),
    });
  } catch (error) {
    console.error('Error reading vehicle specs data:', error);
    return res.status(500).json({ message: 'Error reading vehicle specs data' });
  }
};

const getVehicleSpecs = async (req, res) => {
  try {
    const { make, model } = req.params;
    const specs = await readSpecs();

    const makeEntry = findMakeEntry(specs, make);
    if (!makeEntry) {
      return res.status(404).json({ message: 'Make not found' });
    }

    const modelEntry = findModelEntry(makeEntry.models, model);
    if (!modelEntry) {
      return res.status(404).json({ message: 'Model not found for this make' });
    }

    return res.json({
      make: makeEntry.makeLabel,
      model: modelEntry.modelLabel,
      ...modelEntry.details,
    });
  } catch (error) {
    console.error('Error reading vehicle specs data:', error);
    return res.status(500).json({ message: 'Error reading vehicle specs data' });
  }
};

module.exports = {
  getMakeOverview,
  getVehicleSpecs,
};
