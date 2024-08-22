import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function Redirect() {
    const { id } = useParams();
    const location = useLocation();
    const [key, query] = id.split("?");
    const navigate = useNavigate();

    useEffect(() => {
        const originalUrl = localStorage.getItem(id);
        const queryString = location.search; 
        if (originalUrl) {
            const [baseUrl, originalQuery] = originalUrl.split("?");
            const newUrl = `${baseUrl}?${queryString}`;
            window.location.href = newUrl;
        } else {
            navigate('/');
        }
    }, [id, navigate, key, query]);

    return <div>Redirecting...</div>;
}

export default Redirect;

