import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; // Adjust according to your Firebase config
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "../css/ProjectDetails.css";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [lifts, setLifts] = useState([]);

  useEffect(() => {
    const fetchLifts = async () => {
      const liftsRef = collection(db, "projects", projectId, "lifts");
      const liftsSnapshot = await getDocs(liftsRef);
      setLifts(
        liftsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    };

    fetchLifts();
  }, [projectId]);

  const markLiftAsCompleted = async (liftId) => {
    try {
      const liftRef = doc(db, "projects", projectId, "lifts", liftId);
      await updateDoc(liftRef, { completionStatus: true ,
        completionDate: new Date().toISOString()
      });
      
      // Update the lifts state to immediately reflect the change
      setLifts((prevLifts) =>
        prevLifts.map((lift) =>
          lift.id === liftId ? { ...lift, completionStatus: true } : lift
        )
      );
    } catch (error) {
      console.error("Error updating lift completion status:", error);
    }
  };
  

  return (
    <div className="project-details-container">
      <h2>Project Lifts</h2>
      {lifts.map((lift) => (
        <div key={lift.id} className="lift-item">
          <p>Lift Name: {lift.liftName}</p>
          <p>Status: {lift.completionStatus ? "Completed" : "Not Completed"}</p>
          <button onClick={() => navigate(`/project/${projectId}/lift/${lift.id}`)}>View Stages</button>
          {!lift.completionStatus && (
            <button onClick={() => markLiftAsCompleted(lift.id)}>Mark Lift as Completed</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectDetails;
