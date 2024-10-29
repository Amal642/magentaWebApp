// src/components/AddProject.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import "../css/AddProject.css";

function AddProject() {
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [lifts, setLifts] = useState([{ name: "", budget: "" }]);
  const [stages, setStages] = useState([]);
  const [selectedStages, setSelectedStages] = useState([{ stage: "", days: "" }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClientsAndLocations = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const locationsSnapshot = await getDocs(collection(db, "location"));
        
        setClients(clientsSnapshot.docs.map(doc => doc.data().name));
        setLocations(locationsSnapshot.docs.map(doc => doc.data().place));
      } catch (error) {
        console.error("Error fetching clients and locations:", error);
      }
    };
    fetchClientsAndLocations();
  }, []);

  useEffect(() => {
    const fetchStages = async () => {
      if (!selectedClient) return;
  
      try {
        // First, get the client document ID based on the selected client's name
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const clientDoc = clientsSnapshot.docs.find((doc) => doc.data().name === selectedClient);
  
        if (clientDoc) {
          // Fetch the "liftPhases" sub-collection within the selected client document
          const liftPhasesSnapshot = await getDocs(collection(db, "clients", clientDoc.id, "liftPhases"));
          
          // Map and set the stage names for the dropdown
          const fetchedStages = liftPhasesSnapshot.docs.map(doc => doc.data().name);
          setStages(fetchedStages);
        } else {
          setStages([]);
        }
      } catch (error) {
        console.error("Error fetching stages:", error);
      }
    };
    
    fetchStages();
  }, [selectedClient]);
  

  const handleAddLift = () => setLifts([...lifts, { name: "", budget: "" }]);

const handleAddStage = () =>
  setSelectedStages([...selectedStages, { stage: "", days: "" }]);


  const handleLiftChange = (index, field, value) => {
    const updatedLifts = lifts.map((lift, i) => (i === index ? { ...lift, [field]: value } : lift));
    setLifts(updatedLifts);
  };

  const handleStageChange = (index, field, value) => {
    const updatedStages = selectedStages.map((stage, i) => (i === index ? { ...stage, [field]: value } : stage));
    setSelectedStages(updatedStages);
  };

  const validateAndSubmit = async () => {
    setLoading(true);
    try {
      const projectData = {
        client: selectedClient,
        location: selectedLocation,
        lifts: lifts.reduce((acc, lift, index) => {
          acc[`Lift${index + 1}`] = lift;
          return acc;
        }, {}),
        stages: selectedStages.reduce((acc, stage, index) => {
          acc[`Stage${index + 1}`] = stage;
          return acc;
        }, {}),
      };
  
      await addDoc(collection(db, "projects"), projectData);
      setMessage("Project added successfully!");
      setSelectedClient("");
      setSelectedLocation("");
      setLifts([{ name: "", budget: "" }]);
      setSelectedStages([{ stage: "", days: "" }]);
    } catch (error) {
      console.error("Error adding project:", error);
      setMessage("Failed to add project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`add-project-container ${loading ? "blur" : ""}`}>
      <h2>Add New Project</h2>

      <select
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        className="input-field"
      >
        <option value="">Select Client</option>
        {clients.map(client => (
          <option key={client} value={client}>{client}</option>
        ))}
      </select>

      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
        className="input-field"
      >
        <option value="">Select Location</option>
        {locations.map(location => (
          <option key={location} value={location}>{location}</option>
        ))}
      </select>

      <div className="section">
        <h3>Lifts</h3>
        {lifts.map((lift, index) => (
          <div key={index} className="lift-row">
            <input
              type="text"
              placeholder="Lift Name"
              value={lift.name}
              onChange={(e) => handleLiftChange(index, "name", e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Budget"
              value={lift.budget}
              onChange={(e) => handleLiftChange(index, "budget", e.target.value)}
              className="input-field"
            />
          </div>
        ))}
        <button onClick={handleAddLift} className="add-button">Add Lift</button>
      </div>

      <div className="section">
        <h3>Stages</h3>
        {selectedStages.map((stage, index) => (
          <div key={index} className="stage-row">
            <select
              value={stage.stage}
              onChange={(e) => handleStageChange(index, "stage", e.target.value)}
              className="input-field"
            >
              <option value="">Select Stage</option>
              {stages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Days"
              value={stage.days}
              onChange={(e) => handleStageChange(index, "days", e.target.value)}
              className="input-field"
            />
          </div>
        ))}
        <button onClick={handleAddStage} className="add-button">Add Stage</button>
      </div>

      <button onClick={validateAndSubmit} className="submit-button" disabled={loading}>
        Submit Project
      </button>
      {message && <p className="message">{message}</p>}
      {loading && <div className="spinner-overlay"><div className="spinner"></div></div>}
    </div>
  );
}

export default AddProject;
