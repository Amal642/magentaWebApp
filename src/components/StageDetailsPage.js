import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";

const StageDetailsPage = () => {
  const { projectId, liftId, stageId } = useParams();
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [daysMentioned, setDaysMentioned] = useState(0);
  const [daysTook, setDaysTook] = useState(0); // State for storing the calculated days took
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the project document to retrieve the client name (clientID)
        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);
        const clientName = projectDoc.data()?.client; // client name
        console.log("Client Name:", clientName);

        if (clientName) {
          // Find the client document ID by matching the client name
          const clientsRef = collection(db, "clients");
          const clientQuery = query(clientsRef, where("name", "==", clientName));
          const clientSnapshot = await getDocs(clientQuery);

          if (!clientSnapshot.empty) {
            const clientDoc = clientSnapshot.docs[0];
            const clientID = clientDoc.id; // Actual document ID for the client
            console.log("Client Document ID:", clientID);

            // Fetch lift budget from the project document
            const liftRef = doc(db, "projects", projectId, "lifts", liftId);
            const liftDoc = await getDoc(liftRef);
            const liftData = liftDoc.data();

            // Fetch the stage data
            const stageRef = doc(db, "projects", projectId, "lifts", liftId, "stages", stageId);
            const stageDoc = await getDoc(stageRef);
            const stageData = stageDoc.data();

            // Fetch the liftPhases subcollection using the client document ID
            const liftPhasesRef = collection(db, "clients", clientID, "liftPhases");
            const liftPhasesSnapshot = await getDocs(liftPhasesRef);

            if (!liftPhasesSnapshot.empty) {
              // Find the matching phase percentage based on stageName
              const phaseDoc = liftPhasesSnapshot.docs.find(doc => doc.data().name === stageData?.stageName);
              const phasePercentage = phaseDoc ? parseFloat(phaseDoc.data().percentage) : null;

              if (phasePercentage && liftData?.liftBudget) {
                const calculatedAmount = (liftData.liftBudget * phasePercentage) / 100;
                setClaimableAmount(calculatedAmount);
              }
            } else {
              console.log("No documents found in liftPhases collection for client ID:", clientID);
            }

            // Set days mentioned from the stage's `stageDays`
            setDaysMentioned(stageData?.stageDays || 0);

            // Calculate the days took by subtracting the startDate from the completionDate
            const startDate = new Date(stageData?.startDate); // Convert startDate to a Date object
            const completionDate = new Date(stageData?.completionDate); // Convert completionDate to a Date object

            // Calculate the difference in time and convert to days
            const timeDifference = completionDate - startDate;
            const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

            setDaysTook(daysDifference); // Set the calculated days took
          } else {
            console.log("No client document found with the name:", clientName);
          }
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
      <p><strong>Claimable Amount:</strong> {claimableAmount} AED</p>
      <p><strong>Days Mentioned:</strong> {daysMentioned} days</p>
      <p><strong>Days Took:</strong> {daysTook} days</p>
      <p><strong>Profit/Loss:</strong> {/* Placeholder for future calculation */}</p>
    </div>
  );
};

export default StageDetailsPage;
