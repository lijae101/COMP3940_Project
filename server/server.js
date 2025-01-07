require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { TimestreamQuery } = require('@aws-sdk/client-timestream-query'); // AWS Timestream client
const twilio = require('twilio'); // Twilio client for SMS

const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Middleware to parse JSON request bodies

const port = process.env.PORT || 3001;

// AWS Timestream client setup
const timestreamQueryClient = new TimestreamQuery({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Twilio client setup
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Endpoint to fetch data based on the selected metric and date range
app.get('/getGraphData', async (req, res) => {
    const metric = req.query.metric; // Metric passed as query parameter
    const startDate = req.query.startDate; // Start date passed as query parameter
    const endDate = req.query.endDate; // End date passed as query parameter
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
            WHERE time BETWEEN '${startDate}' AND '${endDate}'
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

// Endpoint to send an emergency SMS
app.post('/sendEmergencySms', async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Missing "to" or "message" field' });
    }

    try {
        const sms = await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
            to,
            body: message,
        });

        console.log(`Message sent: ${sms.sid}`);
        res.status(200).json({ success: true, sid: sms.sid });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
