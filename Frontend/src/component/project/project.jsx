import React from 'react';
import { useNavigate } from 'react-router-dom';
import './project.css';

function ProjectList() {
    const navigate = useNavigate();

    const handleAddProject = () => {
        navigate('/');
    };

    return (
        <div className='project-list-container'>
            <h1>Your Projects</h1>
            <ul className='project-list'>
                
            </ul>
            <button onClick={handleAddProject} className='btn btn-primary'>Add Project</button>
        </div>
    );
}

export default ProjectList;
