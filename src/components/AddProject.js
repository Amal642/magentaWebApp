// src/components/AddProject.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "../css/AddProject.css"; // CSS for styling

function AddProject() {
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [lifts, setLifts] = useState([{ name: "", budget: "" }]);
  const [stages, setStages] = useState([{ name: "", percentage: "" }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch clients and locations from Firebase
    const fetchData = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const locationsSnapshot = await getDocs(collection(db, "location"));
        
        setClients(clientsSnapshot.docs.map(doc => doc.data().name));
        setLocations(locationsSnapshot.docs.map(doc => doc.data().place));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const handleAddLift = () => setLifts([...lifts, { name: "", budget: "" }]);

  const handleAddStage = () => setStages([...stages, { name: "", percentage: "" }]);

  const handleLiftChange = (index, field, value) => {
    const updatedLifts = lifts.map((lift, i) => i === index ? { ...lift, [field]: value } : lift);
    setLifts(updatedLifts);
  };

  const handleStageChange = (index, field, value) => {
    const updatedStages = stages.map((stage, i) => i === index ? { ...stage, [field]: value } : stage);
    setStages(updatedStages);
  };

  const validateAndSubmit = async () => {
    const totalPercentage = stages.reduce((sum, stage) => sum + Number(stage.percentage || 0), 0);
    if (totalPercentage !== 100) {
      setMessage("The total percentage of stages must add up to 100%");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "projects"), {
        client: selectedClient,
        location: selectedLocation,
        lifts: lifts.filter(lift => lift.name && lift.budget),
        stages: stages.filter(stage => stage.name && stage.percentage),
      });
      setMessage("Project added successfully!");
      setSelectedClient("");
      setSelectedLocation("");
      setLifts([{ name: "", budget: "" }]);
      setStages([{ name: "", percentage: "" }]);
    } catch (error) {
      console.error("Error adding project: ", error);
      setMessage("Failed to add project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`add-project-container ${loading ? "blur" : ""}`}>
      <h2>Add New Project</h2>

      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="input-field">
        <option value="">Select Client</option>
        {clients.map(client => <option key={client} value={client}>{client}</option>)}
      </select>

      <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="input-field">
        <option value="">Select Location</option>
        {locations.map(location => <option key={location} value={location}>{location}</option>)}
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
        {stages.map((stage, index) => (
          <div key={index} className="stage-row">
            <input
              type="text"
              placeholder="Stage Name"
              value={stage.name}
              onChange={(e) => handleStageChange(index, "name", e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Percentage"
              value={stage.percentage}
              onChange={(e) => handleStageChange(index, "percentage", e.target.value)}
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
