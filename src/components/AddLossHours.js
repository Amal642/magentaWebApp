// src/components/AddLossHours.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";
// import "../css/AddLossHours.css";

function AddLossHours() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLift, setSelectedLift] = useState("");
  const [date, setDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [hours, setHours] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        setClients(clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedClient) return;

      try {
        const projectsRef = collection(db, "projects");
        const projectsQuery = query(projectsRef, where("client", "==", selectedClient));
        const projectsSnapshot = await getDocs(projectsQuery);
        setProjects(projectsSnapshot.docs.map(doc => doc.data().projectName));
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [selectedClient]);

  useEffect(() => {
    const fetchLifts = async () => {
      if (!selectedProject) return;

      try {
        const projectDocRef = doc(db, "projects", selectedProject);
        const projectDoc = await getDoc(projectDocRef);
        const projectData = projectDoc.data();
        setLifts(projectData?.lifts || []);
      } catch (error) {
        console.error("Error fetching lifts:", error);
      }
    };
    fetchLifts();
  }, [selectedProject]);

  const handleSubmit = async () => {
    if (!selectedClient || !selectedProject || !selectedLift || !date || !hours) {
      setMessage("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "lossHours"), {
        client: selectedClient,
        project: selectedProject,
        lift: selectedLift,
        date,
        remarks,
        hours: Number(hours),
      });

      setMessage("Loss hours added successfully!");
      setSelectedClient("");
      setSelectedProject("");
      setSelectedLift("");
      setDate("");
      setRemarks("");
      setHours("");
    } catch (error) {
      console.error("Error adding loss hours:", error);
      setMessage("Failed to add loss hours. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`add-loss-hours-container ${loading ? "blur" : ""}`}>
      <h2>Add Loss Hours</h2>

      <select
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        className="input-field"
      >
        <option value="">Select Client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.name}>
            {client.name}
          </option>
        ))}
      </select>

      <select className="input-field">
      <option value="">Select Project</option>
      {projects.map((project, index) => (
        <option key={index} value={project}>{project}</option>
      ))}
    </select>

      <select
        value={selectedLift}
        onChange={(e) => setSelectedLift(e.target.value)}
        className="input-field"
        disabled={!selectedProject}
      >
        <option value="">Select Lift</option>
        {lifts.map((lift, index) => (
          <option key={index} value={lift.liftName}>
            {lift.liftName}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input-field"
      />

      <input
        type="text"
        placeholder="Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        className="input-field"
      />

      <input
        type="number"
        placeholder="Hours"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        className="input-field"
      />

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

export default AddLossHours;
