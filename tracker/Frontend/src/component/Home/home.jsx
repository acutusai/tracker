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
    const [term,setTerm] = useState('')
    const [comp,setComp] = useState('')
    const [quote,setquote] = useState('')

    const handleProjectNameChange = (e) => {
        setProjectName(e.target.value);
    };
    
    const handleInputChange = (e) => {
        const url = e.target.value;
        const queryIndex = url.indexOf('?');
        const urlWithoutQuery = queryIndex !== -1 ? url.slice(queryIndex + 1) : '';
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
        const customDomain = 'https://opiniomea.com/';
        const newUniqueId = Date.now().toString(); // Generate unique ID

        const masked = `${customDomain}/redirect/${newUniqueId}?${inputValue}`;
        setMaskedUrl(masked);
        setUniqueId(newUniqueId);

        try {
            const response = await fetch('http://localhost:4000/api/save-links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uniqueId: newUniqueId,
                    projectName,
                    maskedUrl: masked, 
                    complete,
                    quotafull,
                    termination
                }),
            });
            const data = await response.json();
            console.log('Backend response:', data);
            setComp(data.completeUrl);
            setquote(data.quotaFullUrl);
            setTerm(data.terminationUrl);
            
        } catch (error) {
            console.error('Error sending data to the backend:', error);
        }
        try {
            const response = await fetch('http://localhost:4000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uniqueId: newUniqueId,
                    projectName,
                    maskedUrl
                }),
            });
            const data = await response.json();
            console.log('Backend response:', data);
            setComp(data.completeUrl);
            setquote(data.quotaFullUrl);
            setTerm(data.terminationUrl);
            
        } catch (error) {
            console.error('Error sending data to the backend:', error);
        }
    };
    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
      };

    return (
        <div className='container'>
           
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
        <div className="result">
          <div className="masked-link">
            <h2>
              Your Masked Link:
              
            </h2>
            <p>{maskedUrl} <span
                onClick={() => handleCopyToClipboard(maskedUrl)}
                className="copy-icon"
              >
                📋
              </span></p>
          </div>
          <div className="complete-link">
            <h2>
              Your Complete Link:
              
            </h2>
            <p>{comp} <span
                onClick={() => handleCopyToClipboard(comp)}
                className="copy-icon"
              >
                📋
              </span></p>
          </div>
          <div className="termination-link">
            <h2>
              Your Termination Link:
              
            </h2>
            <p>{term}<span
                onClick={() => handleCopyToClipboard(term)}
                className="copy-icon"
              >
                📋
              </span></p>
          </div>
          <div className="quota-full-link">
            <h2>
              Your Quota Full Link:
              
            </h2>
            <p>{quote} <span
                onClick={() => handleCopyToClipboard(quote)}
                className="copy-icon"
              >
                📋
              </span></p>
          </div>
        </div>
      )}
        </div>
    );
}

export default Home;
