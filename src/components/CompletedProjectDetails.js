import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

function ProjectDetails() {
  const { projectId } = useParams();
  const [projectDetails, setProjectDetails] = useState({});
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [daysMentioned, setDaysMentioned] = useState(0);
  const [lossHoursData, setLossHoursData] = useState([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      setProjectDetails(projectDoc.data());

      // Fetch lift budget
      const liftsRef = collection(db, "projects", projectId, "lifts");
      const liftsSnapshot = await getDocs(liftsRef);
      let totalBudget=0;

      liftsSnapshot.forEach(liftDoc => {
        totalBudget = liftDoc.data().liftBudget;
      });
      setClaimableAmount(totalBudget);

      // Fetch days mentioned
      let totalDays=0;
      for (const liftDoc of liftsSnapshot.docs) {
        const stagesRef = collection(db, "projects", projectId, "lifts", liftDoc.id, "stages");
        const stagesSnapshot = await getDocs(stagesRef);
        stagesSnapshot.forEach(stageDoc => {
          totalDays += parseInt(stageDoc.data().stageDays);
        });
      }
      setDaysMentioned(totalDays);

      // Fetch loss hours
      const lossHoursRef = collection(db, "lossHours");
      const lossHoursSnapshot = await getDocs(lossHoursRef);
      const relatedLossHours = lossHoursSnapshot.docs
        .filter(doc => doc.data().project === projectId)
        .map(doc => doc.data());
      setLossHoursData(relatedLossHours);
    };

    fetchProjectDetails();
  }, [projectId]);

  return (
    <div>
      <h2>{projectDetails.projectName} Final Status</h2>
      <p>Claimable Amount: {claimableAmount} AED</p>
      <p>Total Days Mentioned: {daysMentioned}</p>
      {lossHoursData.map((loss, index) => (
        <div key={index}>
          <p>Loss of Hours: {loss.hours}</p>
          <p>Reason: {loss.remarks}</p>
          <p>Claimable for loss of hours: {loss.claimableAmount} AED</p>
        </div>
      ))}
      <p>Profit/Loss: </p>
      <button>Download Invoice</button>
    </div>
  );
}

export default ProjectDetails;
