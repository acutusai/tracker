import React, { useState } from 'react';
import './home.css';

function Home() {
    const [projectName, setProjectName] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [maskedUrl, setMaskedUrl] = useState('');
    const [complete, setComplete] = useState('');
    const [quotafull, setQuotafull] = useState('');
    const [termination, setTermination] = useState('');
    const [uniqueId, setUniqueId] = useState('');

    const handleProjectNameChange = (e) => {
        setProjectName(e.target.value);
    };

    const handleInputChange = (e) => {
        const url = e.target.value;
        const urlWithoutQuery = url.includes('?') ? url.split("?")[1] : '';
        setInputValue(urlWithoutQuery);
        setInputUrl(url);
    };

    const handleValueChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleCompleteChange = (e) => {
        setComplete(e.target.value);
    };

    const handleQuotafullChange = (e) => {
        setQuotafull(e.target.value);
    };

    const handleTerminationChange = (e) => {
        setTermination(e.target.value);
    };

    const generateMaskedLink = async () => {
        console.log('Project Name:', projectName);
        console.log('Masked URL:', maskedUrl);
        console.log('Complete:', complete);
        console.log('Quota Full:', quotafull);
        console.log('Termination:', termination);
        console.log('Unique ID:', uniqueId);
    
        const customDomain = 'https://opiniomea.com/';
        const newUniqueId = Date.now().toString(); // Generate unique ID
    
        // Set the unique ID and masked URL after the state update completes
        setUniqueId(newUniqueId);
        
        const masked = `${customDomain}/redirect/${newUniqueId}?${inputValue}`;
        setMaskedUrl(masked);
    
        // Store the input URL in localStorage
        localStorage.setItem(newUniqueId, inputUrl);
    
        try {
            const response = await fetch('http://localhost:4000/api/save-links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uniqueId: newUniqueId,
                    projectName,
                    maskedUrl: masked, // Use the new masked URL
                    complete,
                    quotafull,
                    termination
                }),
            });
            const data = await response.json();
            console.log('Backend response:', data);
        } catch (error) {
            console.error('Error sending data to the backend:', error);
        }
    };
    
    

    return (
        <div className='container'>
            <h1>Mask Your Survey Link</h1>
            <div className='form-group'>
                <label>Project Name</label>
                <input
                    type="text"
                    value={projectName}
                    onChange={handleProjectNameChange}
                    placeholder="Enter project name"
                    className='form-control'
                />
            </div>

            <div className='form-group'>
                <label>Survey Link</label>
                <input
                    type="text"
                    value={inputUrl}
                    onChange={handleInputChange}
                    placeholder="Enter survey link"
                    className='form-control'
                />
            </div>

            <div className='form-group'>
                <label>Replacement Value</label>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleValueChange}
                    placeholder="Enter value to replace [%RID%]"
                    className='form-control'
                />
            </div>

            <h2>Additional Sources</h2>

            <div className='form-group'>
                <label>Complete Status Link</label>
                <input 
                    type="text"
                    value={complete}
                    onChange={handleCompleteChange}
                    placeholder="Complete status link"
                    className='form-control'
                />
            </div>

            <div className='form-group'>
                <label>Quota Full Status Link</label>
                <input 
                    type="text"
                    value={quotafull}
                    onChange={handleQuotafullChange}
                    placeholder="Quota full status link"
                    className='form-control'
                />
            </div>

            <div className='form-group'>
                <label>Termination Status Link</label>
                <input 
                    type="text"
                    value={termination}
                    onChange={handleTerminationChange}
                    placeholder="Termination status link"
                    className='form-control'
                />
            </div>

            <button onClick={generateMaskedLink} className='btn btn-primary'>Generate Masked Link</button>

            {maskedUrl && (
                <div className='result'>
                    <h2>Your Masked Link:</h2>
                    <p>{maskedUrl}</p>
                    <p>Replace [%RID%] in the survey link with your name or identifier.</p>
                </div>
            )}
        </div>
    );
}

export default Home;
