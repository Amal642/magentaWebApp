// src/components/OwnerDashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/OwnerDashboard.css";

function OwnerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      <div className="button-group">
        <button className="admin-button" onClick={() => navigate("/view-remainders")}>Today's Reminders</button>
        <button className="admin-button" onClick={() => navigate("/add-client")}>Add New Client</button>
        <button className="admin-button" onClick={() => navigate("/add-project")}>Add New Project</button>
        <button className="admin-button" onClick={() => navigate("/ongoing-projects")}>On Going Projects</button>
        <button className="admin-button" onClick={() => navigate("/completedProjects")}>Completed Projects</button>
        {/* <button className="admin-button">Completed Clients</button> */}
        <button className="admin-button" onClick={() => navigate("/add-worker")}>Enter Workers Details</button>
        <button className="admin-button" onClick={()=>navigate("/add-loss-hours")}>Enter Loss of hours</button>
        <button className="admin-button" onClick={()=>navigate("/add-outofscope")}>Enter Out of Scope works</button>
        <button className="admin-button" onClick={() => navigate("/add-worker-absence")}>Enter Worker Absence</button>
        <button className="admin-button" onClick={()=> navigate("/add-remainders")}>Enter Reminders</button>
      </div>
    </div>
  );
}

export default OwnerDashboard;
