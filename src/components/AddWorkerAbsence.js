// src/components/AddWorkerAbsence.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
// import "../css/AddWorkerAbsence.css";

function AddWorkerAbsence() {
  const [workers, setWorkers] = useState([]);
  const [absenceReasons, setAbsenceReasons] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersSnapshot = await getDocs(collection(db, "workers"));
        setWorkers(workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };

    const fetchAbsenceReasons = async () => {
      try {
        const absenceSnapshot = await getDocs(collection(db, "absence"));
        setAbsenceReasons(absenceSnapshot.docs.map(doc => doc.data().reason));
      } catch (error) {
        console.error("Error fetching absence reasons:", error);
      }
    };

    fetchWorkers();
    fetchAbsenceReasons();
  }, []);

  const handleSubmit = async () => {
    if (!selectedWorker || !selectedReason) {
      setMessage("Please select a worker and an absence reason.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "workerAbsences"), {
        workerId: selectedWorker,
        reason: selectedReason,
        remarks: remarks || "N/A",
        date: new Date().toISOString(),
      });
      setMessage("Worker absence recorded successfully!");
      setSelectedWorker("");
      setSelectedReason("");
      setRemarks("");
    } catch (error) {
      console.error("Error submitting absence record:", error);
      setMessage("Failed to record absence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`add-worker-absence-container ${loading ? "blur" : ""}`}>
      <h2>Record Worker Absence</h2>

      <select
        value={selectedWorker}
        onChange={(e) => setSelectedWorker(e.target.value)}
        className="input-field"
      >
        <option value="">Select Worker</option>
        {workers.map(worker => (
          <option key={worker.id} value={worker.id}>{worker.name}</option>
        ))}
      </select>

      <select
        value={selectedReason}
        onChange={(e) => setSelectedReason(e.target.value)}
        className="input-field"
      >
        <option value="">Select Absence Reason</option>
        {absenceReasons.map((reason, index) => (
          <option key={index} value={reason}>{reason}</option>
        ))}
      </select>

      <textarea
        placeholder="Remarks (optional)"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        className="remarks-textarea"
      />

      <button onClick={handleSubmit} className="submit-button" disabled={loading}>
        Submit Absence
      </button>
      
      {message && <p className="message">{message}</p>}
      {loading && <div className="spinner-overlay"><div className="spinner"></div></div>}
    </div>
  );
}

export default AddWorkerAbsence;
