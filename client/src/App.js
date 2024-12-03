import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from 'react-oidc-context';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Home({ setFullScreen }) {
    const auth = useAuth();
    const [graphData, setGraphData] = useState([]);
    const [metric, setMetric] = useState('heart_rate');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const signoutRedirect = () => {
        const clientId = '3hrro1o4857isbr4epti1s7nfi';
        const logoutUri = 'http://localhost:3000/logout';
        const cognitoDomain = 'https://us-west-2paw8u2saq.auth.us-west-2.amazoncognito.com';

        sessionStorage.clear();
        localStorage.clear();

        setFullScreen(true); // Reset to full screen for logout

        const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
            logoutUri
        )}`;
        window.location.href = logoutUrl;
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            setFullScreen(false); // Set small header when logged in
            fetch(
                `http://localhost:3001/getGraphData?metric=${metric}&startDate=${startDate}&endDate=${endDate}`
            )
                .then((response) => response.json())
                .then((data) => setGraphData(data))
                .catch((error) => console.error('Error fetching graph data:', error));
        }
    }, [auth.isAuthenticated, metric, startDate, endDate, setFullScreen]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Error: {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        const labels = graphData.map((entry) => new Date(entry.time).toLocaleString());
        const values = graphData.map((entry) => entry.value);

        const chartData = {
            labels,
            datasets: [
                {
                    label: metric.replace('_', ' ').toUpperCase(),
                    data: values,
                    borderColor: 'blue',
                    borderWidth: 2,
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                    pointBorderColor: 'rgba(0, 123, 255, 1)',
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Data for ${metric.replace('_', ' ').toUpperCase()} (${startDate} to ${endDate})`,
                },
            },
        };

        return (
            <div className="App">
                <header className="App-header small">
                    <h1>Your Health Dashboard</h1>
                </header>
                <div className="controls">
                    <label htmlFor="metric">Select Metric: </label>
                    <select
                        id="metric"
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                    >
                        <option value="heart_rate">Heart Rate</option>
                        <option value="steps">Steps</option>
                        <option value="calories_burned">Calories Burned</option>
                        <option value="sleep_hours">Sleep Hours</option>
                    </select>
                    <label htmlFor="startDate">Start Date: </label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <label htmlFor="endDate">End Date: </label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="chart-container">
                    <Line data={chartData} options={options} />
                </div>
                <button onClick={signoutRedirect} className="signout-button">Sign out</button>
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header full-screen">
                <h1>Welcome to My App</h1>
                <p>Please log in to continue.</p>
                <button onClick={() => auth.signinRedirect()}>Sign in</button>
            </header>
        </div>
    );
}

function Logout({ setFullScreen }) {
    useEffect(() => {
        setFullScreen(true); // Ensure full screen on logout page
    }, [setFullScreen]);

    return (
        <div className="App">
            <header className="App-header full-screen">
                <h1>You have been logged out.</h1>
                <a href="/">Return to Home</a>
            </header>
        </div>
    );
}

function App() {
    const [fullScreen, setFullScreen] = useState(true);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home setFullScreen={setFullScreen} />} />
                <Route path="/logout" element={<Logout setFullScreen={setFullScreen} />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
