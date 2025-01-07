import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { FaHome, FaUser, FaSignOutAlt, FaBars, FaCog } from "react-icons/fa";
import Home from "./Home";
import Profile from "./Profile";
import AddGoal from "./AddGoal";
import "./App.css";
import ChartComponent from "./ChartComponent";

function Logout() {
    const auth = useAuth();

    useEffect(() => {
        auth.signoutRedirect();
    }, [auth]);

    return (
        <div className="App">
            <header className="App-header full-screen">
                <h1>You have been logged out.</h1>
                <Link to="/">Return to Home</Link>
            </header>
        </div>
    );
}

function App() {
    const auth = useAuth();
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    const [graphSettings, setGraphSettings] = useState(() => {
        const savedSettings = localStorage.getItem("graphSettings");
        return savedSettings ? JSON.parse(savedSettings) : { color: "blue", shape: "line" };
    });
    const [goals, setGoals] = useState(() => {
        const savedGoals = localStorage.getItem("goals");
        return savedGoals ? JSON.parse(savedGoals) : [];
    });

    const [menuOpen, setMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("graphSettings", JSON.stringify(graphSettings));
    }, [graphSettings]);

    useEffect(() => {
        localStorage.setItem("goals", JSON.stringify(goals));
    }, [goals]);

    const toggleTheme = (newTheme) => setTheme(newTheme);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Error: {auth.error.message}</div>;
    }

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
        <Router>
            <div className={`App ${theme}`}>
                <header className="main-header">
                    <h1>Health Dashboard</h1>
                    <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                        <FaBars />
                    </button>
                </header>

                <nav className={`menu ${menuOpen ? "open" : ""}`}>
                    <Link to="/" className="nav-link" onClick={toggleMenu}>
                        <FaHome /> Home
                    </Link>
                    <Link to="/profile" className="nav-link" onClick={toggleMenu}>
                        <FaUser /> Profile
                    </Link>
                    <Link className="nav-link" onClick={() => {
                            toggleMenu();
                            setIsSettingsOpen(true);
                        }}>
                    <FaCog />  Settings
                    </Link>
                    
                    <button className="logout-button" onClick={() => auth.signoutRedirect()}>
                        <FaSignOutAlt /> Log Out
                    </button>
                </nav>

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
                                        <ChartComponent type={graphSettings.shape} data={sampleData} />
                                    </div>
                                </div>
                                <div>
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
                                        <ChartComponent type={graphSettings.shape} data={sampleData} />
                                    </div>
                                </div>
                               
                            </div>
                        </div>
                    </div>
                )}

                <Routes>
                    {auth.isAuthenticated ? (
                        <>
                            <Route
                                path="/"
                                element={
                                    <Home
                                        theme={theme}
                                        graphSettings={graphSettings}
                                        setGraphSettings={setGraphSettings}
                                        toggleTheme={toggleTheme}
                                        auth={auth}
                                        goals={goals}
                                    />
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <Profile theme={theme} goals={goals} setGoals={setGoals} />
                                }
                            />
                            <Route
                                path="/add-goal/:metric"
                                element={
                                    <AddGoal
                                        onAddGoal={(metric, goalValue) =>
                                            setGoals((prevGoals) => [
                                                ...prevGoals.filter(
                                                    (goal) => goal.metric !== metric
                                                ),
                                                { metric, goal: goalValue },
                                            ])
                                        }
                                    />
                                }
                            />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <Route
                            path="*"
                            element={
                                <div className="App">
                                    <header className="App-header full-screen">
                                        <h1>Welcome to My App</h1>
                                        <button onClick={() => auth.signinRedirect()}>Sign in</button>
                                    </header>
                                </div>
                            }
                        />
                    )}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
