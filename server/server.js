require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { TimestreamQuery } = require('@aws-sdk/client-timestream-query'); // AWS Timestream client

const app = express();
app.use(cors()); // Allow cross-origin requests

const port = process.env.PORT || 3001;

const timestreamQueryClient = new TimestreamQuery({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Endpoint to fetch data based on the selected metric
app.get('/getGraphData', async (req, res) => {
    const metric = req.query.metric; // Metric passed as query parameter
    let tableName;

    // Map metrics to table names
    switch (metric) {
        case 'heart_rate':
            tableName = 'HeartRate_Table';
            break;
        case 'steps':
            tableName = 'StepCount_Table';
            break;
        case 'calories_burned':
            tableName = 'CaloriesTable';
            break;
        case 'sleep_hours':
            tableName = 'Sleep_Table';
            break;
        default:
            return res.status(400).json({ error: 'Invalid metric specified' });
    }

    const params = {
        QueryString: `
            SELECT user_id, time, measure_value::double AS value
            FROM "HealthData"."${tableName}"
            WHERE time > ago(7d)
            ORDER BY time ASC`,
    };

    try {
        const data = await timestreamQueryClient.query(params);
        const graphData = data.Rows.map((row) => ({
            userId: row.Data[0].ScalarValue,
            time: row.Data[1].ScalarValue,
            value: parseFloat(row.Data[2].ScalarValue),
        }));

        res.json(graphData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
