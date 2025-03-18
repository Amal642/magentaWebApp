import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the path to your Firebase configuration
import "../css/onGoingProjects.css";
import GoBackHomeButton from "./GoBackHomeButton";

const OnGoingProjects = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchOngoingProjects = async () => {
        const projectsRef = collection(db, "projects");
        const ongoingQuery = query(projectsRef, where("completionStatus", "==", false));
        const projectSnapshot = await getDocs(ongoingQuery);
        
        setProjects(
          projectSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      };
  
      fetchOngoingProjects();
    }, []);
  
    const navigateToProjectDetails = (projectId) => {
      navigate(`/project/${projectId}`);
    };
  
  // Mark a project as completed
  const markAsCompleted = async (projectId) => {
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, { completionStatus: true });
      setProjects(projects.filter(project => project.id !== projectId)); // Remove project from list
    } catch (error) {
      console.error("Error updating completion status:", error);
    }
  };

  
  return (
    <div className="ongoing-projects-container">
      <h2>Ongoing Projects</h2>
      {projects.map((project) => (
        <div 
          key={project.id} 
          className="project-item" 
          onClick={() => navigateToProjectDetails(project.id)}
        >
          <p>Project Name: {project.projectName}</p>
          <p>Client: {project.client}</p>
          <p>Location: {project.location}</p>
          <button onClick={() => markAsCompleted(project.id)}>Mark as Completed</button>
          <GoBackHomeButton />
        </div>
      ))}
    </div>
  );
};

export default OnGoingProjects;
