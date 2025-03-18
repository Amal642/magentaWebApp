// src/components/completedProjects.js
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import GoBackHomeButton from "./GoBackHomeButton";

function CompletedProjects() {
  const [completedProjects, setCompletedProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedProjects = async () => {
      try {
        const projectsRef = collection(db, "projects");
        const completedQuery = query(projectsRef, where("completionStatus", "==", true));
        const snapshot = await getDocs(completedQuery);
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompletedProjects(projects);
      } catch (error) {
        console.error("Error fetching completed projects:", error);
      }
    };
    fetchCompletedProjects();
  }, []);

  return (
    <div>
      <h2>Completed Projects</h2>
      {completedProjects.map(project => (
        <div key={project.id} className="project-item">
          <h3>{project.projectName}</h3>
          <h5>{project.client}</h5>
          <button onClick={() => navigate(`/completedProjects/${project.id}`)}>View Details</button>
        </div>
      ))}
      <GoBackHomeButton />
    </div>
  );
}

export default CompletedProjects;
