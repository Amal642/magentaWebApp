import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import "../css/LiftDetails.css";
import { Link } from "react-router-dom";

const LiftDetails = () => {
  const { projectId, liftId } = useParams();
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
//   const [selectedClient,setSelectedClient]=useState([]);

  const handleStageClick = (stage) => {
    if (stage.completionStatus) {
      setSelectedStage(stage); // Open details for completed stage
    }
  };
  useEffect(() => {
    const fetchStages = async () => {
      const stagesRef = collection(db, "projects", projectId, "lifts", liftId, "stages");
      const stagesSnapshot = await getDocs(stagesRef);
      setStages(
        stagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    };

    fetchStages();
  }, [projectId, liftId]);

  const markStageAsCompleted = async (stageId) => {
    try {
      const completionDate = new Date(); // Current date
      const stageRef = doc(db, "projects", projectId, "lifts", liftId, "stages", stageId);
      
      await updateDoc(stageRef, {
        completionStatus: true,
        completionDate: completionDate.toISOString(), // Store ISO string for consistency
      });
  
      setStages((prevStages) =>
        prevStages.map((stage) =>
          stage.id === stageId ? { ...stage, completionStatus: true, completionDate } : stage
        )
      );
    } catch (error) {
      console.error("Error updating stage completion status:", error);
    }
  };
 
  

  return (
    <div className="lift-details-container">
      <h2>Lift Details</h2>
      {stages.map((stage) => (
        <div key={stage.id} onClick={() => handleStageClick(stage)} className="stage-item">
          <p>Stage: {stage.stageName}</p>
          <p>Status: {stage.completionStatus ? "Completed" : "Not Completed"}</p>
          {!stage.completionStatus ? (
            <button onClick={() => markStageAsCompleted(stage.id)}>Mark as Completed</button>
          ):(
          <Link to={`/stage-details/${projectId}/${liftId}/${stage.id}`}>
            View Details
          </Link>)}
        </div>
      ))}
      
    </div>
  );
};

export default LiftDetails;
