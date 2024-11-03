import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";

const StageDetailsPage = () => {
  const { projectId, liftId, stageId } = useParams();
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [daysMentioned, setDaysMentioned] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the project document to retrieve the selected client ID
        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);
        const clientID = projectDoc.data()?.client; // Assumes client ID is stored in the project document

        if (clientID) {
          setSelectedClient(clientID);

          // Fetch lift budget from the project document
          const liftRef = doc(db, "projects", projectId, "lifts", liftId);
          const liftDoc = await getDoc(liftRef);
          const liftData = liftDoc.data();

          // Fetch lift phase percentage from the client document
          const clientRef = doc(db, "clients", clientID);
          const clientDoc = await getDoc(clientRef);
          const liftPhases = clientDoc.data()?.liftPhases;

          const stageRef = doc(db, "projects", projectId, "lifts", liftId, "stages", stageId);
          const stageDoc = await getDoc(stageRef);
          const stageData = stageDoc.data();

          // Calculate claimable amount based on lift phase percentage and lift budget
          const phasePercentage = liftPhases?.find(phase => phase.phase === stageData.stageName)?.percentage;
          if (phasePercentage && liftData?.liftBudget) {
            const calculatedAmount = (liftData.liftBudget * phasePercentage) / 100;
            setClaimableAmount(calculatedAmount);
          }

          // Set days mentioned from the stage's `stageDays`
          setDaysMentioned(stageData?.stageDays || 0);
        }
      } catch (error) {
        console.error("Error fetching stage details:", error);
      }
    };

    fetchData();
  }, [projectId, liftId, stageId]);

  return (
    <div className="stage-details-page">
      <h2>Stage Details</h2>
      <p><strong>Claimable Amount:</strong> ${claimableAmount}</p>
      <p><strong>Days Mentioned:</strong> {daysMentioned} days</p>
      <p><strong>Days Took:</strong> {/* Placeholder for future calculation */}</p>
      <p><strong>Profit/Loss:</strong> {/* Placeholder for future calculation */}</p>
    </div>
  );
};

export default StageDetailsPage;
