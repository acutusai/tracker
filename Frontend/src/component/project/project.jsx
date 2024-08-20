import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './project.css';

function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="project-page">
      <div className="but">
        <button onClick={() => navigate('/list')}>
          Add project
        </button>
      </div>

      <header className="page-header">
        <h1>Our Projects</h1>
        <p>Explore our latest projects and initiatives.</p>
      </header>

      <div className="project-grid">
        {projects.map((project) => (
          <div key={project._id} className="project-card">
            <div className="project-image">
              <img src={project.imageUrl} alt={project.title} />
            </div>
            <div className="project-content">
              <h2 className="project-title">{project.title}</h2>
              <p className="project-description">{project.description}</p>
              <div className="project-tags">
                {project.tags.map((tag, index) => (
                  <span key={index} className={`tag tag-${tag.toLowerCase()}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <a href={project.url} className="project-link">
                Learn More
              </a>
              {/* Display associated URLs */}
              <div className="project-urls">
                {project.urlIds.map((url, index) => (
                  <div key={index}>
                    <h3>Masked URL: {url.maskedUrl}</h3>
                    <p>Complete: {url.complete}</p>
                    <p>Quota Full: {url.quotafull}</p>
                    <p>Termination: {url.termination}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectPage;
