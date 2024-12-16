import React, { useState, useEffect } from 'react';
import ChartComponent from './ChartComponent';
import './Home.css';





function Home({ theme, graphSettings, setGraphSettings, toggleTheme, auth }) {
    const [graphData, setGraphData] = useState([]);
    const [metric, setMetric] = useState('heart_rate');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const signoutRedirect = () => {
        const clientId = '3hrro1o4857isbr4epti1s7nfi';
        const logoutUri = 'http://localhost:3000/logout';
        const cognitoDomain = 'https://us-west-2paw8u2saq.auth.us-west-2.amazoncognito.com';

        sessionStorage.clear();
        localStorage.clear();

        // setFullScreen(true); // Reset to full screen for logout

        const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
            logoutUri
        )}`;
        window.location.href = logoutUrl;
    };
    useEffect(() => {
        fetch(
            `http://localhost:3001/getGraphData?metric=${metric}&startDate=${startDate}&endDate=${endDate}`
        )
            .then((response) => response.json())
            .then((data) => setGraphData(data))
            .catch((error) => console.error('Error fetching graph data:', error));
    }, [metric, startDate, endDate]);

    const labels = graphData.map((entry) => new Date(entry.time).toLocaleString());
    const values = graphData.map((entry) => entry.value);

    const chartData = {
        labels,
        datasets: [
            {
                label: metric.replace('_', ' ').toUpperCase(),
                data: values,
                borderColor: graphSettings.color,
                borderWidth: 2,
                backgroundColor: `${graphSettings.color}40`,
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
        <div className={`Home ${theme}`}>
            <header>
                <h1>Your Health Dashboard</h1>
                <button className="settings-button" onClick={() => setIsSettingsOpen(true)}>
                    Open Settings
                </button>
            </header>
            <div className="controls">
                <label htmlFor="metric">Metric: </label>
                <select id="metric" value={metric} onChange={(e) => setMetric(e.target.value)}>
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
            <ChartComponent
                type={graphSettings.shape}
                data={chartData}
                options={options}
            />
            

            {isSettingsOpen && (
                <div className="modal">
                    <div className={`modal-content ${theme}`}>
                        <h2>Settings</h2>
                        <button
                            className="close-button"
                            onClick={() => setIsSettingsOpen(false)}
                        >
                            Close
                        </button>
                        <div className="settings-options">
                            <div className="option">
                                <label>Theme: </label>
                                <select
                                    value={theme}
                                    onChange={(e) => toggleTheme(e.target.value)}
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                            <div className="option">
                                <label>Graph Color: </label>
                                <input
                                    type="color"
                                    value={graphSettings.color}
                                    onChange={(e) =>
                                        setGraphSettings((prev) => ({
                                            ...prev,
                                            color: e.target.value,
                                        }))
                                    }
                                />
                                <div className="preview">
                                    <ChartComponent
                                        type={graphSettings.shape}
                                        data={{
                                            labels: ['Sample A', 'Sample B'],
                                            datasets: [
                                                {
                                                    data: [10, 20],
                                                    borderColor: graphSettings.color,
                                                    borderWidth: 2,
                                                    backgroundColor: `${graphSettings.color}40`,
                                                },
                                            ],
                                        }}
                                        options={{ responsive: true }}
                                    />
                                </div>
                            </div>
                            <div className="option">
                                <label>Graph Shape: </label>
                                <select
                                    value={graphSettings.shape}
                                    onChange={(e) =>
                                        setGraphSettings((prev) => ({
                                            ...prev,
                                            shape: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="line">Line</option>
                                    <option value="bar">Bar</option>
                                </select>
                                <div className="preview">
                                    <ChartComponent
                                        type={graphSettings.shape}
                                        data={{
                                            labels: ['Sample A', 'Sample B'],
                                            datasets: [
                                                {
                                                    data: [10, 20],
                                                    borderColor: graphSettings.color,
                                                    borderWidth: 2,
                                                    backgroundColor: `${graphSettings.color}40`,
                                                },
                                            ],
                                        }}
                                        options={{ responsive: true }}
                                    />
                                </div>
                            </div>
                            <div className="logout-option">
                            <button onClick={signoutRedirect} className="signout-button">Sign out</button>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
}

export default Home;
