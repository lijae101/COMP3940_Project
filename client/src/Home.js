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
    const [selectedRange, setSelectedRange] = useState("7d");
    const [summaryModal, setSummaryModal] = useState({ isOpen: false, content: "" });

    const metrics = ["heart_rate", "steps", "calories_burned", "sleep_hours"];

    const getStartDateFromRange = (range) => {
        const date = new Date();
        switch (range) {
            case "7d":
                date.setDate(date.getDate() - 7);
                break;
            case "14d":
                date.setDate(date.getDate() - 14);
                break;
            case "1m":
                date.setMonth(date.getMonth() - 1);
                break;
            case "3m":
                date.setMonth(date.getMonth() - 3);
                break;
            case "6m":
                date.setMonth(date.getMonth() - 6);
                break;
            case "1y":
                date.setFullYear(date.getFullYear() - 1);
                break;
            default:
                date.setDate(date.getDate() - 7);
        }
        return date.toISOString().split("T")[0];
    };

    const startDate = getStartDateFromRange(selectedRange);
    const endDate = new Date().toISOString().split("T")[0];

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
    }, [selectedRange]);

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
            <div className="chart-wrapper">
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

    return (
        <div className={`Home ${theme}`}>
            <div className="controls">
                <label>Date Range: Last  </label>
                <select
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value)}
                    className="date-range-selector"
                >
                    <option value="7d">7 Days</option>
                    <option value="14d">2 Weeks</option>
                    <option value="1m">1 Month</option>
                    <option value="3m">3 Months</option>
                    <option value="6m">6 Months</option>
                    <option value="1y">1 Year</option>
                </select>
            </div>

            <div className="charts">
                {renderChart("heart_rate", "Heart Rate")}
                {renderChart("steps", "Steps")}
                {renderChart("calories_burned", "Calories Burned")}
                {renderChart("sleep_hours", "Sleep Hours")}
            </div>

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
