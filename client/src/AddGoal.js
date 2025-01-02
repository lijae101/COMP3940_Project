import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AddGoal.css";

function AddGoal({ onAddGoal }) {
    const { metric } = useParams();
    const [goalValue, setGoalValue] = useState(
        metric === "sleep" ? { wakeUp: "", bedtime: "" } : ""
    );
    const navigate = useNavigate();

    const handleSaveGoal = () => {
        if (metric === "sleep") {
            if (!goalValue.wakeUp || !goalValue.bedtime) {
                alert("Please set both wake-up time and bedtime.");
                return;
            }
        } else if (!goalValue) {
            alert(`Please set a valid goal for ${metric}.`);
            return;
        }
        onAddGoal(metric, goalValue);
        navigate("/profile");
    };

    return (
        <div className="AddGoal">
            <h1>Set Goal for {metric.toUpperCase()}</h1>
            {metric === "sleep" ? (
                <>
                    <label>
                        Wake-up Time:
                        <input
                            type="time"
                            value={goalValue.wakeUp}
                            onChange={(e) =>
                                setGoalValue((prev) => ({ ...prev, wakeUp: e.target.value }))
                            }
                        />
                    </label>
                    <label>
                        Bedtime:
                        <input
                            type="time"
                            value={goalValue.bedtime}
                            onChange={(e) =>
                                setGoalValue((prev) => ({ ...prev, bedtime: e.target.value }))
                            }
                        />
                    </label>
                </>
            ) : (
                <>
                    <label>
                        {metric === "calories"
                            ? "Calories to Burn:"
                            : metric === "steps"
                            ? "Daily Steps Target:"
                            : "Set Goal:"}
                        <input
                            type="number"
                            value={goalValue}
                            onChange={(e) => setGoalValue(e.target.value)}
                        />
                    </label>
                </>
            )}
            <div className="button-group">
                <button onClick={handleSaveGoal}>Save Goal</button>
                <button onClick={() => navigate("/profile")}>Cancel</button>
            </div>
        </div>
    );
}

export default AddGoal;
