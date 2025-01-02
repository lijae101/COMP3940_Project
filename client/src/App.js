import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import Home from "./Home";
import Profile from "./Profile";
import AddGoal from "./AddGoal";
import "./App.css";

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

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Error: {auth.error.message}</div>;
    }

    return (
        <Router>
            <div className={`App ${theme}`}>
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
                                    <Profile
                                        theme={theme}
                                        goals={goals}
                                        setGoals={setGoals}
                                    />
                                }
                            />
                            <Route
                                path="/add-goal/:metric"
                                element={
                                    <AddGoal
                                        onAddGoal={(metric, goalValue) =>
                                            setGoals((prevGoals) => [
                                                ...prevGoals.filter((goal) => goal.metric !== metric),
                                                { metric, goal: goalValue },
                                            ])
                                        }
                                    />
                                }
                            />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <Route
                            path="*"
                            element={
                                <div className="App">
                                    <header className="App-header full-screen">
                                        <h1>Welcome to My App</h1>
                                        <p>Please log in to continue.</p>
                                        <button onClick={() => auth.signinRedirect()}>Sign in</button>
                                    </header>
                                </div>
                            }
                        />
                    )}
                </Routes>
                {auth.isAuthenticated && (
                    <nav className="bottom-nav">
                        <Link to="/" className="nav-link">
                            Dashboard
                        </Link>
                        <Link to="/profile" className="nav-link">
                            Profile
                        </Link>
                    </nav>
                )}
            </div>
        </Router>
    );
}

export default App;
