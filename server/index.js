
const express = require('express');
const cors = require('cors');

const componentRoutes = require('./routes/components');
const vehicleRoutes = require('./routes/vehicles');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/components', componentRoutes);
app.use('/api/vehicles', vehicleRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the Car Audio API!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
