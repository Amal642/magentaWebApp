// src/components/AddWorkers.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import "../css/AddClient.css";

function AddWorkers() {
  const [workerName, setWorkerName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddWorker = async () => {
    if (!workerName.trim()) {
      setMessage("Please enter a valid worker name.");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Check if the worker already exists
      const workersRef = collection(db, "workers");
      const q = query(workersRef, where("name", "==", workerName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessage("Worker already exists.");
        setLoading(false);
        return;
      }

      // Add new worker to Firestore
      await addDoc(workersRef, { name: workerName });
      setMessage("Worker added successfully!");
      setWorkerName("");
    } catch (error) {
      console.error("Error adding worker: ", error);
      setMessage("Failed to add worker. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className={`add-client-container ${loading ? "blur" : ""}`}>
      <h2>Add New Worker</h2>
      <input
        type="text"
        placeholder="Enter worker name"
        value={workerName}
        onChange={(e) => setWorkerName(e.target.value)}
        className="client-input"
      />
      <button onClick={handleAddWorker} className="add-client-button" disabled={loading}>
        Add Worker
      </button>
      {message && <p className="message">{message}</p>}
      {loading && <div className="spinner-overlay"><div className="spinner"></div></div>}
    </div>
  );
}

export default AddWorkers;
