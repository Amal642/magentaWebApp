// src/components/AddProject.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import "../css/AddProject.css";

function AddProject() {
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [lifts, setLifts] = useState([{ name: "", budget: "", stages: [{ stage: "", days: "" }] }]);
  const [stages, setStages] = useState([]);
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
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const clientDoc = clientsSnapshot.docs.find((doc) => doc.data().name === selectedClient);
  
        if (clientDoc) {
          const liftPhasesSnapshot = await getDocs(collection(db, "clients", clientDoc.id, "liftPhases"));
          setStages(liftPhasesSnapshot.docs.map(doc => doc.data().name));
        } else {
          setStages([]);
        }
      } catch (error) {
        console.error("Error fetching stages:", error);
      }
    };
    
    fetchStages();
  }, [selectedClient]);

  const handleAddLift = () => setLifts([...lifts, { name: "", budget: "", stages: [{ stage: "", days: "" }] }]);

  const handleAddStage = (liftIndex) => {
    const updatedLifts = lifts.map((lift, i) =>
      i === liftIndex ? { ...lift, stages: [...lift.stages, { stage: "", days: "" }] } : lift
    );
    setLifts(updatedLifts);
  };

  const handleLiftChange = (index, field, value) => {
    const updatedLifts = lifts.map((lift, i) => (i === index ? { ...lift, [field]: value } : lift));
    setLifts(updatedLifts);
  };

  const handleStageChange = (liftIndex, stageIndex, field, value) => {
    const updatedLifts = lifts.map((lift, i) => 
      i === liftIndex 
        ? { 
            ...lift, 
            stages: lift.stages.map((stage, j) => 
              j === stageIndex ? { ...stage, [field]: value } : stage
            ) 
          } 
        : lift
    );
    setLifts(updatedLifts);
  };

  const validateAndSubmit = async () => {
    setLoading(true);
    try {
      // Check if a project exists for the same client and location
      const projectQuery = query(
        collection(db, "projects"),
        where("client", "==", selectedClient),
        where("location", "==", selectedLocation)
      );
      const projectSnapshot = await getDocs(projectQuery);
      
      let projectRef;

      if (!projectSnapshot.empty) {
        projectRef = projectSnapshot.docs[0].ref; // Get the existing project reference
      } else {
        // Create a new project if no matching client/location is found
        const newProject = await addDoc(collection(db, "projects"), {
          client: selectedClient,
          location: selectedLocation,
        });
        projectRef = newProject;
      }

      // Add each lift with stages to the same project
      for (const lift of lifts) {
        const liftRef = await addDoc(collection(projectRef, "lifts"), {
          liftName: lift.name,
          liftBudget: lift.budget,
        });

        for (const stage of lift.stages) {
          await addDoc(collection(liftRef, "stages"), {
            stageName: stage.stage,
            stageDays: stage.days,
          });
        }
      }

      setMessage("Project and lifts added successfully!");
      setSelectedClient("");
      setSelectedLocation("");
      setLifts([{ name: "", budget: "", stages: [{ stage: "", days: "" }] }]);
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
        {lifts.map((lift, liftIndex) => (
          <div key={liftIndex} className="lift-row">
            <input
              type="text"
              placeholder="Lift Name"
              value={lift.name}
              onChange={(e) => handleLiftChange(liftIndex, "name", e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Budget"
              value={lift.budget}
              onChange={(e) => handleLiftChange(liftIndex, "budget", e.target.value)}
              className="input-field"
            />

            {lift.stages.map((stage, stageIndex) => (
              <div key={stageIndex} className="stage-row">
                <select
                  value={stage.stage}
                  onChange={(e) => handleStageChange(liftIndex, stageIndex, "stage", e.target.value)}
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
                  onChange={(e) => handleStageChange(liftIndex, stageIndex, "days", e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
            <button onClick={() => handleAddStage(liftIndex)} className="add-button">
              Add Stage
            </button>
          </div>
        ))}
        <button onClick={handleAddLift} className="add-button">Add Lift</button>
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
