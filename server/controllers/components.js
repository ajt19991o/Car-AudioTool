
const fs = require('fs');
const path = require('path');

const componentsFilePath = path.join(__dirname, '../data/components.json');

const getComponents = (req, res) => {
  fs.readFile(componentsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading components data' });
    }
    res.json(JSON.parse(data));
  });
};

module.exports = {
  getComponents,
};
