// src/components/ViewRemainders.js
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc ,deleteDoc } from "firebase/firestore";
import '../css/reminders.css'

function ViewRemainders() {
  const [remainders, setRemainders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemainders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "remainders"));
        const fetchedRemainders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRemainders(fetchedRemainders);
      } catch (error) {
        console.error("Error fetching remainders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRemainders();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this reminder?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "remainders", id));
      setRemainders((prev) => prev.filter((rem) => rem.id !== id)); // Update state after deletion
    } catch (error) {
      console.error("Error deleting remainder:", error);
    }
  };
  

  const markAsCompleted = async (id) => {
    try {
      const remainderRef = doc(db, "remainders", id);
      await updateDoc(remainderRef, {
        completed: true,
        completedAt: new Date(),
      });
      setRemainders((prev) =>
        prev.map((rem) =>
          rem.id === id ? { ...rem, completed: true, completedAt: new Date() } : rem
        )
      );
    } catch (error) {
      console.error("Error updating remainder:", error);
    }
  };

  if (loading) return <p>Loading reminders...</p>;

  return (
    <div>
      <h2>Reminders</h2>
      {remainders.length === 0 ? (
        <p>No remainders found.</p>
      ) : (
        <ul className="remainder-list">
          {remainders.map((remainder) => (
            
            <li key={remainder.id} className="remainder-item">
              <p>{remainder.details}</p>
              <p><strong>Added on:</strong> {new Date(remainder.timestamp.seconds * 1000).toLocaleString()}</p>
              
              {remainder.completed ? (
                <p><strong>Completed on:</strong> {new Date(remainder.completedAt.seconds * 1000).toLocaleString()}</p>
              ) : (
                <button onClick={() => markAsCompleted(remainder.id)} className="complete-button">
                  Mark as Completed
                </button>
                
              )}
              <button onClick={() => handleDelete(remainder.id)} className="delete-button">
  🗑
</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ViewRemainders;
