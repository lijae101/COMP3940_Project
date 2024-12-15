import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Settings({ theme, graphSettings, setGraphSettings, toggleTheme }) {
    const navigate = useNavigate();

    return (
        <div className={`Settings ${theme}`}>
            <header>
                <h1>Settings</h1>
                <button onClick={() => navigate('/')}>Back to Dashboard</button>
            </header>
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
                            setGraphSettings((prev) => ({ ...prev, color: e.target.value }))
                        }
                    />
                </div>
                <div className="option">
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
                </div>
            </div>
        </div>
    );
}

export default Settings;
