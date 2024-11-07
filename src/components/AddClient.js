import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import "../css/AddClient.css";

function AddClient() {
  const [clientName, setClientName] = useState("");
  const [stages, setStages] = useState([{ name: "", percentage: "" }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddClient = async () => {
    if (!clientName.trim()) {
      setMessage("Please enter a valid client name.");
      return;
    }

    // Calculate the total percentage
    const totalPercentage = stages.reduce((sum, stage) => sum + Number(stage.percentage || 0), 0);
    if (totalPercentage !== 100) {
      setMessage("Total percentage of all stages must equal 100%.");
      return;
    }

    setLoading(true);

    try {
      // Check if the client already exists
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, where("name", "==", clientName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessage("Client already exists.");
        setLoading(false);
        return;
      }

      // Add new client to Firestore
      const clientDoc = await addDoc(clientsRef, { name: clientName,completedStatus:false });

      // Add stages as a sub-collection inside the client document
      const stagesCollectionRef = collection(clientDoc, "liftPhases");
      await Promise.all(
        stages
          .filter(stage => stage.name && stage.percentage)
          .map(stage => addDoc(stagesCollectionRef, { name: stage.name, percentage: stage.percentage }))
      );

      setMessage("Client and lift phases added successfully!");
      setClientName("");
      setStages([{ name: "", percentage: "" }]);
    } catch (error) {
      console.error("Error adding client: ", error);
      setMessage("Failed to add client. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => setStages([...stages, { name: "", percentage: "" }]);

  const handleStageChange = (index, field, value) => {
    const updatedStages = stages.map((stage, i) =>
      i === index ? { ...stage, [field]: value } : stage
    );
    setStages(updatedStages);
  };

  return (
    <div className={`add-client-container ${loading ? "blur" : ""}`}>
      <h2>Add New Client</h2>
      <input
        type="text"
        placeholder="Enter client name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        className="client-input"
      />
      
      <div className="stages-section">
        <h3>Stages of Lift Installation</h3>
        {stages.map((stage, index) => (
          <div key={index} className="stage-row">
            <input
              type="text"
              placeholder={`Stage ${index + 1} Name`}
              value={stage.name}
              onChange={(e) => handleStageChange(index, "name", e.target.value)}
              className="stage-input"
            />
            <input
              type="number"
              placeholder="% Completion"
              value={stage.percentage}
              onChange={(e) => handleStageChange(index, "percentage", e.target.value)}
              className="stage-input"
            />
          </div>
        ))}
        <button onClick={handleAddStage} className="add-stage-button">
          Add Stage
        </button>
      </div>

      <button onClick={handleAddClient} className="add-client-button" disabled={loading}>
        Add Client
      </button>
      {message && <p className="message">{message}</p>}
      {loading && <div className="spinner-overlay"><div className="spinner"></div></div>}
    </div>
  );
}

export default AddClient;
