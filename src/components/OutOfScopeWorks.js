// src/components/OutOfScopeWorks.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import '../css/reminders.css'

function OutOfScopeWorks() {
  const [outOfScopeWork, setOutOfScopeWork] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!outOfScopeWork.trim()) {
      setMessage("Please enter the details.");
      return;
    }

    try {
      await addDoc(collection(db, "outOfScopeWorks"), {
        details: outOfScopeWork,
        timestamp: new Date(),
      });
      setMessage("Out of Scope Work added successfully!");
      setOutOfScopeWork("");
    } catch (error) {
      console.error("Error adding out of scope work:", error);
      setMessage("Failed to add out of scope work. Please try again.");
    }
  };

  return (
    <div>
      <h2>Enter Out of Scope Works</h2>
      <textarea
        value={outOfScopeWork}
        onChange={(e) => setOutOfScopeWork(e.target.value)}
        placeholder="Enter details here"
        rows="4"
        className="input-field"
      ></textarea>
      <button onClick={handleSubmit} className="submit-button">
        Submit
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default OutOfScopeWorks;
