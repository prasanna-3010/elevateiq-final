const express = require('express');
const cors = require('cors'); // Import CORS middleware
const app = express();
const port = 4002;

// Enable CORS for all routes
app.use(cors());

// Data storage for lift information
let lifts = {
    lift1: { isOverloaded: false, floor: "Unknown" },
};

// Data storage for distance and weight
let distanceData = { distance: 0 };
let weightData = { weight: 0 };

app.use(express.static('public'));

// Default route for root
app.get('/', (req, res) => {
    res.send('Welcome to the Lift Management System Server!');
});

// Endpoint to handle distance data and calculate floor
app.get('/update-distance', (req, res) => {
    const { distance } = req.query;

    // Validate the distance parameter
    if (!distance) {
        return res.status(400).send('Distance parameter is missing');
    }

    // Update the distance data
    const numericDistance = parseFloat(distance);
    distanceData.distance = numericDistance;

    // Determine the floor based on distance
    if (numericDistance <= 40 && numericDistance > 30) {
        lifts.lift1.floor = "Ground Floor";
    } else if (numericDistance <= 30 && numericDistance > 20) {
        lifts.lift1.floor = "First Floor";
    } else if (numericDistance <= 20 && numericDistance > 10) {
        lifts.lift1.floor = "Second Floor";
    } else if (numericDistance <= 10) {
        lifts.lift1.floor = "Third Floor";
    } else {
        lifts.lift1.floor = "Unknown"; // For distances > 40 or invalid readings
    }

    console.log(`Distance updated to: ${distanceData.distance} cm, Floor: ${lifts.lift1.floor}`);
    res.send(`Distance received: ${distanceData.distance} cm, Floor: ${lifts.lift1.floor}`);
});

// Endpoint to handle weight data and update overload status for lift1
app.get('/update-weight', (req, res) => {
    const { weight } = req.query;

    // Validate the weight parameter
    if (!weight) {
        return res.status(400).send('Weight parameter is missing');
    }

    // Update the weight data
    const numericWeight = parseFloat(weight);
    weightData.weight = numericWeight;

    // Check if weight exceeds the threshold
    if (numericWeight > 20) {
        lifts.lift1.isOverloaded = true;
    } else {
        lifts.lift1.isOverloaded = false;
    }

    console.log(`Weight updated to: ${weightData.weight} grams, Overloaded: ${lifts.lift1.isOverloaded}`);
    res.send(`Weight received: ${weightData.weight} grams, Overloaded: ${lifts.lift1.isOverloaded}`);
});

// Endpoint to view all status data as JSON
app.get('/get-status', (req, res) => {
    const status = {
        lift1: {
            isOverloaded: lifts.lift1.isOverloaded,
            floor: lifts.lift1.floor,
        },
        distanceData: distanceData.distance,
        weightData: weightData.weight,
    };

    res.json(status); // Send all status data as JSON
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).send('Endpoint not found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://192.168.1.6:${port}`);
});
