import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import "../css/enterProjectCompletion.css";

function EnterProjectCompletion() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLift, setSelectedLift] = useState("");
  const [completionDates, setCompletionDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      const clientsSnapshot = await getDocs(collection(db, "clients"));
      setClients(clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedClient) return;
      const projectsRef = collection(db, "projects");
      const projectsQuery = query(projectsRef, where("client", "==", selectedClient));
      const projectsSnapshot = await getDocs(projectsQuery);
      setProjects(projectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, [selectedClient]);

  useEffect(() => {
    const fetchLifts = async () => {
      if (!selectedProject) return;
      const liftsRef = collection(db, "projects", selectedProject, "lifts");
      const liftsSnapshot = await getDocs(liftsRef);
      setLifts(liftsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchLifts();
  }, [selectedProject]);

  useEffect(() => {
    const fetchStages = async () => {
      if (!selectedLift) return;
      const stagesRef = collection(db, "projects", selectedProject, "lifts", selectedLift, "stages");
      const stagesSnapshot = await getDocs(stagesRef);
      setStages(stagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchStages();
  }, [selectedProject, selectedLift]);

  const handleDateChange = (stageId, date) => {
    setCompletionDates((prev) => ({ ...prev, [stageId]: date }));
  };

  const markStageCompleted = async (stageId) => {
    if (!completionDates[stageId]) {
      setMessage("Please enter a completion date before marking as completed.");
      return;
    }

    setLoading(true);
    try {
      const stageRef = doc(db, "projects", selectedProject, "lifts", selectedLift, "stages", stageId);
      await updateDoc(stageRef, {
        completionStatus: true,
        completionDate: completionDates[stageId],
      });

      setStages((prevStages) =>
        prevStages.map((stage) =>
          stage.id === stageId ? { ...stage, completionStatus: true, completionDate: completionDates[stageId] } : stage
        )
      );
      setMessage("Stage marked as completed!");
    } catch (error) {
      console.error("Error updating stage completion:", error);
      setMessage("Failed to mark stage as completed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enter-project-completion-container">
      <h2>Enter Project Completion</h2>

      <select className="select-field" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
        <option value="">Select Client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.name}>{client.name}</option>
        ))}
      </select>

      <select className="select-field" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={!selectedClient}>
        <option value="">Select Project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>{project.projectName}</option>
        ))}
      </select>

      <select className="select-field" value={selectedLift} onChange={(e) => setSelectedLift(e.target.value)} disabled={!selectedProject}>
        <option value="">Select Lift</option>
        {lifts.map((lift) => (
          <option key={lift.id} value={lift.id}>{lift.liftName}</option>
        ))}
      </select>

      <div>
        <h3>Stages:</h3>
        <ul className="stages-list">
          {stages.map((stage) => (
            <li key={stage.id} className="stage-item">
              <span>{stage.stageName}</span>
              <span>
                {stage.completionStatus ? (
                  <span className="completed-text">Completed on {stage.completionDate}</span>
                ) : (
                  <>
                    <input
                      type="date"
                      className="date-input"
                      value={completionDates[stage.id] || ""}
                      onChange={(e) => handleDateChange(stage.id, e.target.value)}
                    />
                    <button
                      onClick={() => markStageCompleted(stage.id)}
                      className="mark-completed-button"
                      disabled={loading}
                    >
                      Mark as Completed
                    </button>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {message && <p className="message">{message}</p>}
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default EnterProjectCompletion;
