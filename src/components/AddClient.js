// src/components/AddClient.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc, doc } from "firebase/firestore";
import "../css/AddClient.css";

function AddClient() {
  const [clientName, setClientName] = useState("");
  const [stages, setStages] = useState([{ name: "" }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddClient = async () => {
    if (!clientName.trim()) {
      setMessage("Please enter a valid client name.");
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
      const clientDoc = await addDoc(clientsRef, { name: clientName });
      
      // Add stages as a sub-collection inside the client document
      const stagesCollectionRef = collection(clientDoc, "liftPhases");
      await Promise.all(
        stages
          .filter(stage => stage.name)
          .map(stage => addDoc(stagesCollectionRef, { name: stage.name }))
      );

      setMessage("Client and lift phases added successfully!");
      setClientName("");
      setStages([{ name: "" }]);
    } catch (error) {
      console.error("Error adding client: ", error);
      setMessage("Failed to add client. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => setStages([...stages, { name: "" }]);

  const handleStageChange = (index, value) => {
    const updatedStages = stages.map((stage, i) => 
      i === index ? { ...stage, name: value } : stage
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
          <input
            key={index}
            type="text"
            placeholder={`Stage ${index + 1}`}
            value={stage.name}
            onChange={(e) => handleStageChange(index, e.target.value)}
            className="stage-input"
          />
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
