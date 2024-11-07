import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import '../css/enterworkers.css';

function EnterWorkerTimeOut() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [stages, setStages] = useState([]);
  const [workersWithTimeIn, setWorkersWithTimeIn] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLift, setSelectedLift] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch functions for clients, projects, lifts, and stages...
  useEffect(() => {
    const fetchClients = async () => {
      const clientsSnapshot = await getDocs(collection(db, "clients"));
      setClients(clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);
  console.log("SelectedClient "+selectedClient);
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
  }, [selectedProject,selectedLift]);


  const fetchWorkersWithTimeIn = async () => {
    if (!selectedClient || !selectedProject || !selectedLift || !selectedStage) return;

    setLoading(true);
    const workersQuery = query(
      collection(db, "workerDetails"),
      where("client", "==", selectedClient),
      where("project", "==", selectedProject),
      where("lift", "==", selectedLift),
      where("stage", "==", selectedStage),
      where("timeOut", "==", null) // fetch only those with no timeOut
    );

    const workersSnapshot = await getDocs(workersQuery);
    const workersData = workersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setWorkersWithTimeIn(workersData);
    setLoading(false);
  };

  const handleTimeOutChange = (workerId, timeOut) => {
    const updatedWorkers = workersWithTimeIn.map(worker =>
      worker.id === workerId ? { ...worker, timeOut } : worker
    );
    setWorkersWithTimeIn(updatedWorkers);
  };

  const handleSubmit = async () => {
    if (workersWithTimeIn.some(worker => !worker.timeOut)) {
      alert("Please enter a Time Out for all selected workers.");
      return;
    }

    setLoading(true);
    try {
      const updatePromises = workersWithTimeIn.map(async (worker) => {
        const workerRef = doc(db, "workerDetails", worker.id);
        return updateDoc(workerRef, { timeOut: worker.timeOut });
      });
      await Promise.all(updatePromises);

      setMessage("Time Out details submitted successfully!");
      setWorkersWithTimeIn([]);
    } catch (error) {
      console.error("Error submitting Time Out details:", error);
      setMessage("Failed to submit Time Out details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient && selectedProject && selectedLift && selectedStage) {
      fetchWorkersWithTimeIn();
    }
  }, [selectedClient, selectedProject, selectedLift, selectedStage]);

  return (
    <div className="enter-worker-details-container">
      <h2>Enter Worker Time Out</h2>

      {/* Existing dropdowns for client, project, lift, and stage */}
      <select className="select-field" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
    <option value="">Select Client</option>
    {clients.map(client => (
      <option key={client.id} value={client.name}>{client.name}</option>
    ))}
  </select>

  <select className="select-field" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={!selectedClient}>
    <option value="">Select Project</option>
    {projects.map(project => (
      <option key={project.id} value={project.id}>{project.projectName}</option>
    ))}
  </select>

  <select className="select-field" value={selectedLift} onChange={(e) => setSelectedLift(e.target.value)} disabled={!selectedProject}>
    <option value="">Select Lift</option>
    {lifts.map(lift => (
      <option key={lift.id} value={lift.id}>{lift.liftName}</option>
    ))}
  </select>

  <select className="select-field" value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} disabled={!selectedLift}>
    <option value="">Select Stage</option>
    {stages.map(stage => (
      <option key={stage.id} value={stage.id}>{stage.stageName}</option>
    ))}
  </select>

      <div>
        <h3>Workers with Time In:</h3>
        <ul className="selected-workers-list">
          {workersWithTimeIn.map((worker) => (
            <li key={worker.id} className="selected-worker-item">
              {worker.name} (Time In: {worker.timeIn}) 
              <input 
                type="time" 
                value={worker.timeOut || ""} 
                onChange={(e) => handleTimeOutChange(worker.id, e.target.value)}
                className="time-input"
              />
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleSubmit} className="submit-button" disabled={loading}>
        Submit
      </button>

      {message && <p className="message">{message}</p>}
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default EnterWorkerTimeOut;
