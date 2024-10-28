// src/components/AddSupervisor.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import "../css/AddClient.css";

function AddSupervisor() {
  const [supervisorName, setSupervisorName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSupervisor = async () => {
    if (!supervisorName.trim()) {
      setMessage("Please enter a valid supervisor name.");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Check if the supervisor already exists
      const supervisorsRef = collection(db, "supervisors");
      const q = query(supervisorsRef, where("name", "==", supervisorName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessage("Supervisor already exists.");
        setLoading(false);
        return;
      }

      // Add new supervisor to Firestore
      await addDoc(supervisorsRef, { name: supervisorName });
      setMessage("Supervisor added successfully!");
      setSupervisorName("");
    } catch (error) {
      console.error("Error adding supervisor: ", error);
      setMessage("Failed to add supervisor. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className={`add-client-container ${loading ? "blur" : ""}`}>
      <h2>Add New Supervisor</h2>
      <input
        type="text"
        placeholder="Enter supervisor name"
        value={supervisorName}
        onChange={(e) => setSupervisorName(e.target.value)}
        className="client-input"
      />
      <button onClick={handleAddSupervisor} className="add-client-button" disabled={loading}>
        Add Supervisor
      </button>
      {message && <p className="message">{message}</p>}
      {loading && <div className="spinner-overlay"><div className="spinner"></div></div>}
    </div>
  );
}

export default AddSupervisor;
