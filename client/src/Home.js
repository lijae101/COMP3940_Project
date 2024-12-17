import React, { useState, useEffect } from "react";
import ChartComponent from "./ChartComponent";
import "./Home.css";

function Home({ theme, graphSettings, setGraphSettings, toggleTheme, auth }) {
    const [graphData, setGraphData] = useState({
        heart_rate: [],
        steps: [],
        calories_burned: [],
        sleep_hours: [],
    });
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [summaryModal, setSummaryModal] = useState({ isOpen: false, content: "" });

    const metrics = ["heart_rate", "steps", "calories_burned", "sleep_hours"];

    const signoutRedirect = () => {
        const clientId = "3hrro1o4857isbr4epti1s7nfi";
        const logoutUri = "http://localhost:3000/logout";
        const cognitoDomain = "https://us-west-2paw8u2saq.auth.us-west-2.amazoncognito.com";

        sessionStorage.clear();
        localStorage.clear();

        const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
            logoutUri
        )}`;
        window.location.href = logoutUrl;
    };

    useEffect(() => {
        metrics.forEach((metric) => {
            fetch(
                `http://localhost:3001/getGraphData?metric=${metric}&startDate=${startDate}&endDate=${endDate}`
            )
                .then((response) => response.json())
                .then((data) =>
                    setGraphData((prev) => ({
                        ...prev,
                        [metric]: data,
                    }))
                )
                .catch((error) => console.error(`Error fetching data for ${metric}:`, error));
        });
    }, [startDate, endDate]);

    const chartOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                color: theme === "dark" ? "white" : "#333",
            },
            legend: {
                labels: {
                    color: theme === "dark" ? "white" : "#333",
                },
            },
        },
        elements: {
            line: { tension: 0.4 },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { display: false, color: theme === "dark" ? "white" : "#333" },
            },
            y: {
                grid: { color: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(200,200,200,0.2)" },
                ticks: { color: theme === "dark" ? "white" : "#333" },
            },
        },
    });

    const renderChart = (metric, title) => (
        <div className={`chart-container ${theme}`} onClick={() => handleChartClick(metric)}>
            <h3>{title}</h3>
            <ChartComponent
                type={graphSettings.shape}
                data={{
                    labels: graphData[metric].map((entry) => entry.time),
                    datasets: [
                        {
                            label: title,
                            data: graphData[metric].map((entry) => entry.value),
                            borderColor: graphSettings.color,
                            backgroundColor: `${graphSettings.color}40`,
                        },
                    ],
                }}
                options={chartOptions(title)}
            />
        </div>
    );

    const handleChartClick = (metric) => {
        const average =
            graphData[metric].reduce((acc, cur) => acc + cur.value, 0) / graphData[metric].length || 0;
        setSummaryModal({
            isOpen: true,
            content: `Average ${metric.replace("_", " ")}: ${average.toFixed(2)}`,
        });
    };

    const sampleData = {
        labels: ["Sample A", "Sample B", "Sample C"],
        datasets: [
            {
                label: "Sample Preview",
                data: [10, 20, 15],
                borderColor: graphSettings.color,
                backgroundColor: `${graphSettings.color}40`,
            },
        ],
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
                <label>Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <label>End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="charts">
                {renderChart("heart_rate", "Heart Rate")}
                {renderChart("steps", "Steps")}
                {renderChart("calories_burned", "Calories Burned")}
                {renderChart("sleep_hours", "Sleep Hours")}
            </div>

            {isSettingsOpen && (
                <div className="modal">
                    <div className={`modal-content ${theme}`}>
                        <h2>Settings</h2>
                        <button className="close-button" onClick={() => setIsSettingsOpen(false)}>
                            Close
                        </button>
                        <div className="settings-options">
                            <div>
                                <label>Theme: </label>
                                <select value={theme} onChange={(e) => toggleTheme(e.target.value)}>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                            <div>
                                <label>Graph Color: </label>
                                <input
                                    type="color"
                                    value={graphSettings.color}
                                    onChange={(e) =>
                                        setGraphSettings((prev) => ({ ...prev, color: e.target.value }))
                                    }
                                />
                                <div className="preview">
                                    <ChartComponent type={graphSettings.shape} data={sampleData} />
                                </div>
                            </div>
                            <div>
                                <label>Graph Shape: </label>
                                <select
                                    value={graphSettings.shape}
                                    onChange={(e) =>
                                        setGraphSettings((prev) => ({ ...prev, shape: e.target.value }))
                                    }
                                >
                                    <option value="line">Line</option>
                                    <option value="bar">Bar</option>
                                </select>
                                <div className="preview">
                                    <ChartComponent type={graphSettings.shape} data={sampleData} />
                                </div>
                            </div>
                        </div>
                        <div className="logout-option">
                            <button onClick={signoutRedirect} className="logout-button">
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {summaryModal.isOpen && (
                <div className="modal">
                    <div className={`modal-content ${theme}`}>
                        <h2>Summary</h2>
                        <p>{summaryModal.content}</p>
                        <button
                            className="close-button"
                            onClick={() => setSummaryModal({ isOpen: false, content: "" })}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
