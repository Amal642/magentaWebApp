// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import OwnerDashboard from "./components/OwnerDashboard";
import SupervisorPage from "./components/SupervisorPage";
import AddClient from "./components/AddClient";
import AddSupervisor from "./components/AddSupervisor";
import AddWorkers from "./components/AddWorkers";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/supervisor-page" element={<SupervisorPage />} />
          <Route path="/add-client" element={<AddClient />} />
          <Route path="/add-supervisor" element={<AddSupervisor />} />
          <Route path="/add-worker" element={<AddWorkers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
