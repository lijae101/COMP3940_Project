import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import './App.css';

function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light'; // Load theme from localStorage
    });

    const [graphSettings, setGraphSettings] = useState(() => {
        const savedSettings = localStorage.getItem('graphSettings');
        return savedSettings
            ? JSON.parse(savedSettings)
            : { color: 'blue', shape: 'line' };
    });

    // Apply the theme dynamically to the body
    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Persist graph settings in localStorage
    useEffect(() => {
        localStorage.setItem('graphSettings', JSON.stringify(graphSettings));
    }, [graphSettings]);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            theme={theme}
                            graphSettings={graphSettings}
                            setGraphSettings={setGraphSettings}
                            toggleTheme={toggleTheme}
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
