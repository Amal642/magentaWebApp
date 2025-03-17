import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import "../css/AddClient.css";
import GoBackHomeButton from "./GoBackHomeButton";

function AddWorkers() {
  const [workerName, setWorkerName] = useState("");
  const [designation, setDesignation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddWorker = async () => {
    if (!workerName.trim() || !designation.trim()) {
      setMessage("Please enter a valid worker name and designation.");
      return;
    }

    setLoading(true);

    try {
      const workersRef = collection(db, "workers");
      await addDoc(workersRef, { name: workerName, designation: designation });
      setMessage("Worker added successfully!");
      setWorkerName("");
      setDesignation("");
    } catch (error) {
      console.error("Error adding worker: ", error);
      setMessage("Failed to add worker. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const workersRef = collection(db, "workers");
        for (let row of jsonData) {
          if (row.Name && row.Designation) {
            await addDoc(workersRef, { name: row.Name, designation: row.Designation });
          }
        }
        setMessage("Workers added successfully!");
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading file: ", error);
      setMessage("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
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
      <input
        type="text"
        placeholder="Enter designation"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
        className="client-input"
      />
      <h2>OR</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="file-input" />

      <button onClick={handleAddWorker} className="add-client-button" disabled={loading}>
        Add Worker
      </button>
      
      {message && <p className="message">{message}</p>}
      {loading && <div className="spinner-overlay"><div className="spinner"></div></div>}
      <GoBackHomeButton />
    </div>
  );
}

export default AddWorkers;
