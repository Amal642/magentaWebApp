import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/OwnerDashboard.css";

function SupervisorPage() {
  const navigate = useNavigate();
  return (
    <div className="admin-container">
      <h2>Supervisor Dashboard</h2>
      <div className="button-group">
        <button className="admin-button">Today's Remainders</button>
        <button className="admin-button" onClick={()=>navigate("/add-Workerdetails")}>Enter Details of Workers</button>
        <button className="admin-button"  onClick={() => navigate("/add-worker-absence")}>Enter Absent Workers</button>
        <button className="admin-button">Enter Project Completion Details</button>
        <button className="admin-button">Enter Time-Out Details</button>
      </div>
    </div>
  );
}

export default SupervisorPage;
// onClick={() => navigate("/add-client")