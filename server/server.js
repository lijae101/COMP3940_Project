require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const { TimestreamQuery } = require('@aws-sdk/client-timestream-query'); // Import Timestream client

const app = express();
const port = process.env.PORT || 3000;  // Set the port for the server

// Initialize Timestream Query Client with AWS credentials and region
const timestreamQueryClient = new TimestreamQuery({
  region: process.env.AWS_REGION,  // Using region from .env file
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // AWS Access Key from .env
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // AWS Secret Key from .env
  },
});

// Define a route to fetch a sample value from the HeartRate_Table in Timestream
app.get('/getHeartRate', async (req, res) => {
  try {
    const params = {
      QueryString: `SELECT * FROM "HealthData"."HeartRate_Table" LIMIT 1`,  // Sample query to fetch data
    };

    // Execute the query
    const data = await timestreamQueryClient.query(params);

    // Respond with the results
    res.json({
      message: 'Data fetched successfully!',
      data: data.Rows,  // Send the queried data as JSON
    });
  } catch (error) {
    console.error('Error fetching data from Timestream:', error);
    res.status(500).json({
      message: 'Failed to fetch data from Timestream.',
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
