import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaWalking, FaBed, FaBurn } from "react-icons/fa"; // Importing icons
import "./Profile.css";

function Profile({ theme, goals, graphData = {} }) {
    const [personalInfo, setPersonalInfo] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
        age: 30,
        height: 175,
        weight: 70,
    });
    const [emergencyNumber, setEmergencyNumber] = useState(() => localStorage.getItem("emergencyNumber") || "");
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
                if (permission !== "granted") {
                    console.warn("Notification permission not granted.");
                }
            });
        }
    }, []);

    const handleEditPersonalInfo = () => setEditing(!editing);

    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSavePersonalInfo = () => setEditing(false);

    const handleEmergencyNumberSave = () => {
        localStorage.setItem("emergencyNumber", emergencyNumber);
        alert("Emergency phone number saved!");
    };

    const scheduleNotification = (time, message) => {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);

        const targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);

        const delay = targetTime.getTime() - now.getTime();
        if (delay > 0) {
            setTimeout(() => {
                alert(message); // Simple alert as a fallback for notifications
            }, delay);
        } else {
            console.warn(`Scheduled time "${time}" has already passed.`);
        }
    };

    const handleSleepNotifications = (goal) => {
        if (goal.wakeUp) {
            scheduleNotification(goal.wakeUp, "Good morning! Time to wake up!");
        }
        if (goal.bedtime) {
            scheduleNotification(goal.bedtime, "It's bedtime! Time to sleep.");
        }
    };

    const calculateProgress = (metric, goal) => {
        const data = graphData[metric]?.map((entry) => entry.value) || [];
        const total = data.reduce((sum, value) => sum + value, 0);

        const numericGoal = parseFloat(goal);
        if (!numericGoal) return 0;

        return Math.min((total / numericGoal) * 100, 100).toFixed(0);
    };

    const renderProgressCircle = (metric, goal) => {
        if (!goal) return null;

        if (metric === "sleep" && typeof goal === "object") {
            handleSleepNotifications(goal);

            return (
                <div className="progress-container" key={metric}>
                    <h3>SLEEP <FaBed /></h3>
                    <p>Wake-Up: {goal.wakeUp}</p>
                    <p>Bedtime: {goal.bedtime}</p>
                </div>
            );
        }

        const progress = calculateProgress(metric, goal);

        const icon =
            metric === "steps" ? <FaWalking /> : metric === "calories" ? <FaBurn /> : null;

        return (
            <div className="progress-container" key={metric}>
                <h3>
                    {metric.replace("_", " ").toUpperCase()} {icon}
                </h3>
                <div
                    className="circle"
                    style={{
                        background: `conic-gradient(#4caf50 ${progress}%, #ddd ${progress}%)`,
                    }}
                >
                    <div className="circle-inner">
                        <span>{progress}%</span>
                    </div>
                </div>
                <p>Goal: {goal}</p>
            </div>
        );
    };

    const detectDangerousHeartRate = () => {
        const heartRateData = graphData.heart_rate?.map((entry) => entry.value) || [];

        // Example rule: If heart rate exceeds 120 for more than 3 consecutive entries
        const isDangerous = heartRateData.some((value, index, array) => {
            return (
                array[index] > 120 &&
                array[index + 1] > 120 &&
                array[index + 2] > 120
            );
        });

        if (isDangerous) {
            sendEmergencyNotification();
        }
    };

    const sendEmergencyNotification = async () => {
        if (!emergencyNumber) {
            alert("No emergency number saved!");
            return;
        }
    
        const message = "Emergency Alert: Dangerous heart rate pattern detected!";
    
        try {
            const response = await fetch("http://localhost:3001/sendEmergencySms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: emergencyNumber,
                    message,
                }),
            });
    
            const data = await response.json();
    
            if (data.success) {
                alert(`Emergency SMS sent to ${emergencyNumber}`);
            } else {
                console.error(data.error);
                alert("Failed to send SMS. Check server logs for details.");
            }
        } catch (error) {
            console.error("Error sending emergency SMS:", error);
            alert("Error sending SMS. Check console logs.");
        }
    };
    

    useEffect(() => {
        detectDangerousHeartRate();
    }, [graphData]);

    return (
        <div className={`Profile ${theme}`}>
            <header>
                <h1>Your Health Dashboard</h1>
            </header>

            <div className="personal-info">
                <h2>Personal Information</h2>
                {editing ? (
                    <div className="info-edit">
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={personalInfo.name}
                                onChange={handlePersonalInfoChange}
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={personalInfo.email}
                                onChange={handlePersonalInfoChange}
                            />
                        </label>
                        <label>
                            Age:
                            <input
                                type="number"
                                name="age"
                                value={personalInfo.age}
                                onChange={handlePersonalInfoChange}
                            />
                        </label>
                        <label>
                            Height (cm):
                            <input
                                type="number"
                                name="height"
                                value={personalInfo.height}
                                onChange={handlePersonalInfoChange}
                            />
                        </label>
                        <label>
                            Weight (kg):
                            <input
                                type="number"
                                name="weight"
                                value={personalInfo.weight}
                                onChange={handlePersonalInfoChange}
                            />
                        </label>
                        <button onClick={handleSavePersonalInfo}>Save</button>
                    </div>
                ) : (
                    <div className="info-display">
                        <p><strong>Name:</strong> {personalInfo.name}</p>
                        <p><strong>Email:</strong> {personalInfo.email}</p>
                        <p><strong>Age:</strong> {personalInfo.age}</p>
                        <p><strong>Height:</strong> {personalInfo.height} cm</p>
                        <p><strong>Weight:</strong> {personalInfo.weight} kg</p>
                        <button onClick={handleEditPersonalInfo}>Edit</button>
                    </div>
                )}
            </div>

            <div className="emergency-section">
                <h2>Emergency Contact</h2>
                <input
                    type="text"
                    placeholder="Enter emergency phone number"
                    value={emergencyNumber}
                    onChange={(e) => setEmergencyNumber(e.target.value)}
                />
                <button onClick={handleEmergencyNumberSave}>Save Emergency Number</button>
            </div>

            <div className="goal-buttons">
                <h2>Set Goals</h2>
                <button onClick={() => navigate("/add-goal/steps")}>Add Goal for Steps</button>
                <button onClick={() => navigate("/add-goal/sleep")}>Add Goal for Sleep</button>
                <button onClick={() => navigate("/add-goal/calories")}>Add Goal for Calories</button>
            </div>

            {goals.length > 0 && (
                <div className="progress-section">
                    <h2>Goal Progress</h2>
                    <div className="progress-grid">
                        {goals.map(({ metric, goal }) => renderProgressCircle(metric, goal))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
