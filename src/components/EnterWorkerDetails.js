// src/pages/EnterWorkerDetails.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, query, where, doc,getDoc,setDoc } from 'firebase/firestore';
import '../css/enterworkers.css'


function EnterWorkerDetails() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [stages, setStages] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLift, setSelectedLift] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedWorkersList, setSelectedWorkersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    const fetchWorkers = async () => {
      const workersSnapshot = await getDocs(collection(db, "workers"));
      setWorkers(workersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchWorkers();
  }, []);

  const addWorker = () => {
    if (selectedWorker && !selectedWorkersList.some(w => w.name === selectedWorker)) {
      setSelectedWorkersList([...selectedWorkersList, { name: selectedWorker, timeIn: "" ,timeOut:null}]);
      setSelectedWorker("");
    }
  };

  const removeWorker = (workerName) => {
    setSelectedWorkersList(selectedWorkersList.filter(w => w.name !== workerName));
  };

  const handleTimeInChange = (index, time) => {
    const updatedWorkers = [...selectedWorkersList];
    updatedWorkers[index].timeIn = time;
    setSelectedWorkersList(updatedWorkers);
  };
  const handleSubmit = async () => {
    if (!selectedClient || !selectedProject || !selectedLift || !selectedStage || selectedWorkersList.length === 0) {
        alert("Please fill out all fields and select at least one worker");
        return;
    }

    setLoading(true);
    const currentDate = new Date().toISOString();

    try {
        const projectRef = doc(db, "projects", selectedProject);
        const liftRef = doc(db, "projects", selectedProject, "lifts", selectedLift);
        const stageRef = doc(db, "projects", selectedProject, "lifts", selectedLift, "stages", selectedStage);

        // Function to check and set startDate if not exists
        const checkAndSetStartDate = async (ref) => {
            const snapshot = await getDoc(ref);
            if (!snapshot.exists() || !snapshot.data().startDate) {
                await setDoc(ref, { startDate: currentDate }, { merge: true });
            }
        };

        // Ensure startDate is set
        await checkAndSetStartDate(projectRef);
        await checkAndSetStartDate(liftRef);
        await checkAndSetStartDate(stageRef);

        // Submit Worker Details
        await addDoc(collection(db, "workerDetails"), {
            client: selectedClient,
            project: selectedProject,
            lift: selectedLift,
            stage: selectedStage,
            workers: selectedWorkersList,
            dateTime: currentDate
        });

        alert("Worker details submitted successfully!");
        setSelectedClient("");
        setSelectedProject("");
        setSelectedStage("");
        setSelectedLift("");
        setSelectedWorkersList([]);
    } catch (error) {
        console.error("Error submitting worker details:", error);
        alert("Failed to submit worker details.");
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="enter-worker-details-container">
  <h2>Enter Worker Details</h2>

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
        <label>Select Worker:</label>
        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="input-field"
        >
          <option value="">Select Worker</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.name}>
              {worker.name}
            </option>
          ))}
        </select>
        <button onClick={addWorker} className="add-worker-button">Add Worker</button>
      </div>

      <div>
        <h3>Selected Workers:</h3>
        <ul className="selected-workers-list">
          {selectedWorkersList.map((worker, index) => (
            <li key={index} className="selected-worker-item">
              {worker.name} 
              <input 
                type="time" 
                value={worker.timeIn} 
                onChange={(e) => handleTimeInChange(index, e.target.value)}
                className="time-input"
              />
              <span onClick={() => removeWorker(worker.name)} className="remove-worker">x</span>
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

export default EnterWorkerDetails;
