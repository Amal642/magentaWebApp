// src/components/AddClient.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import "../css/AddClient.css";

function AddClient() {
  const [clientName, setClientName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddClient = async () => {
    if (!clientName.trim()) {
      setMessage("Please enter a valid client name.");
      return;
    }
    setLoading(true); // Start loading

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
      await addDoc(clientsRef, { name: clientName });
      setMessage("Client added successfully!");
      setClientName("");
    } catch (error) {
      console.error("Error adding client: ", error);
      setMessage("Failed to add client. Please try again.");
    }
    finally {
        setLoading(false); // End loading
      }
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
      <button onClick={handleAddClient} className="add-client-button" disabled={loading}>
        Add Client
      </button>
      {message && <p className="message">{message}</p>}
      {loading && <div className="spinner-overlay"><div className="spinner"></div></div>}
    </div>
  );
}

export default AddClient;
