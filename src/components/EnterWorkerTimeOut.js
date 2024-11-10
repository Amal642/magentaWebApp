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

  const fetchWorkersWithTimeIn = async () => {
    if (!selectedClient || !selectedProject || !selectedLift || !selectedStage) return;

    setLoading(true);
    const workersQuery = query(
      collection(db, "workerDetails"),
      where("client", "==", selectedClient),
      where("project", "==", selectedProject),
      where("lift", "==", selectedLift),
      where("stage", "==", selectedStage)
    );

    const workersSnapshot = await getDocs(workersQuery);
    const workersData = [];

    workersSnapshot.forEach(doc => {
      const workerDoc = doc.data();
      workerDoc.workers = workerDoc.workers.filter(worker => worker.timeIn && !worker.timeOut);
      if (workerDoc.workers.length > 0) {
        workersData.push({ id: doc.id, ...workerDoc });
      }
    });

    setWorkersWithTimeIn(workersData);
    setLoading(false);
  };

  // Handle timeOut change for individual workers
  const handleTimeOutChange = (docId, workerIndex, timeOut) => {
    const updatedWorkers = workersWithTimeIn.map(item => {
      if (item.id === docId) {
        const updatedWorkerList = [...item.workers];
        updatedWorkerList[workerIndex] = { ...updatedWorkerList[workerIndex], timeOut };
        return { ...item, workers: updatedWorkerList };
      }
      return item;
    });
    setWorkersWithTimeIn(updatedWorkers);
  };

  // Submit function to update individual timeOut in Firebase
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updatePromises = workersWithTimeIn.map(async (workerDoc) => {
        const workerRef = doc(db, "workerDetails", workerDoc.id);
        const updatedWorkers = workerDoc.workers.map(worker => ({
          ...worker,
          timeOut: worker.timeOut || null, // Ensure only updated workers have timeOut
        }));

        await updateDoc(workerRef, { workers: updatedWorkers });
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
          {workersWithTimeIn.map(workerDoc =>
            workerDoc.workers.map((worker, index) => (
              <li key={`${workerDoc.id}-${index}`} className="selected-worker-item">
                <p>{worker.name} - Time In: {worker.timeIn}</p>
                <label>
                  Enter Time Out:
                  <input 
                    type="time" 
                    value={worker.timeOut || ""} 
                    onChange={(e) => handleTimeOutChange(workerDoc.id, index, e.target.value)}
                    className="time-input"
                  />
                </label>
              </li>
            ))
          )}
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
