// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes,useParams } from "react-router-dom";
import Login from "./components/Login";
import OwnerDashboard from "./components/OwnerDashboard";
import SupervisorPage from "./components/SupervisorPage";
import AddClient from "./components/AddClient";
import AddSupervisor from "./components/AddSupervisor";
import AddWorkers from "./components/AddWorkers";
import AddProject from "./components/AddProject";
import AddWorkerAbsence from "./components/AddWorkerAbsence";
import AddLossHours from "./components/AddLossHours";
import OnGoingProjects from "./components/onGoingProjects";
import ProjectDetails from "./components/ProjectDetails";
import LiftDetails from "./components/LiftDetails";
import StageDetailsPage from "./components/StageDetailsPage";
import CompletedProjects from "./components/completedProjects";
import CompletedProjectDetails from "./components/CompletedProjectDetails";
import OutOfScopeWorks from "./components/OutOfScopeWorks";
import Remainders from "./components/Remainders";

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
          <Route path="/add-project" element={<AddProject/>}/>
          <Route path="/add-worker-absence" element={<AddWorkerAbsence/>}/>
          <Route path="/add-loss-hours" element={<AddLossHours/>}/>
          <Route path="/ongoing-projects" element={<OnGoingProjects/>}/>
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="/project/:projectId/lift/:liftId" element={<LiftDetails />} />
          <Route path="/stage-details/:projectId/:liftId/:stageId" element={<StageDetailsPage/>} />
          <Route path="/completedProjects" element={<CompletedProjects />} />
          <Route path="/completedProjects/:projectId" element={<CompletedProjectDetails />} />
          <Route path="/add-outofscope" element={<OutOfScopeWorks/>}/>
          <Route path="/add-remainders" element={<Remainders/>}/>

          </Routes>
      </div>
    </Router>
  );
}

export default App;
