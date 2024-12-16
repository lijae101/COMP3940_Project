import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Home from './Home';
import './App.css';

function Logout() {
    const auth = useAuth();

    useEffect(() => {
        auth.signoutRedirect();
    }, [auth]);

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
    const auth = useAuth();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [graphSettings, setGraphSettings] = useState(() => {
        const savedSettings = localStorage.getItem('graphSettings');
        return savedSettings
            ? JSON.parse(savedSettings)
            : { color: 'blue', shape: 'line' };
    });

    // Apply theme to the body
    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Save graph settings
    useEffect(() => {
        localStorage.setItem('graphSettings', JSON.stringify(graphSettings));
    }, [graphSettings]);

    const toggleTheme = (newTheme) => setTheme(newTheme);

    // Authentication loading and error handling
    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Error: {auth.error.message}</div>;
    }

    return (
        <Router>
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
        </Router>
    );
}

export default App;
