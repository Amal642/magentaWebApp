// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import OwnerDashboard from "./components/OwnerDashboard";
import SupervisorPage from "./components/SupervisorPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/supervisor-page" element={<SupervisorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
