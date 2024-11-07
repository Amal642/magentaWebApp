// src/components/Remainders.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import '../css/reminders.css'

function Remainders() {
  const [remainder, setRemainder] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!remainder.trim()) {
      setMessage("Please enter the details.");
      return;
    }

    try {
      await addDoc(collection(db, "remainders"), {
        details: remainder,
        timestamp: new Date(),
      });
      setMessage("Remainder added successfully!");
      setRemainder("");
    } catch (error) {
      console.error("Error adding remainder:", error);
      setMessage("Failed to add remainder. Please try again.");
    }
  };

  return (
    <div>
      <h2>Enter Remainders</h2>
      <textarea
        value={remainder}
        onChange={(e) => setRemainder(e.target.value)}
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

export default Remainders;
