import React from "react";
import "../css/OwnerDashboard.css";

function SupervisorPage() {
  return (
    <div className="admin-container">
      <h2>Supervisor Dashboard</h2>
      <div className="button-group">
        <button className="admin-button">Today's Remainders</button>
        <button className="admin-button">Enter Details of Workers</button>
       
      </div>
    </div>
  );
}

export default SupervisorPage;
