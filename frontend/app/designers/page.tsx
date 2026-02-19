import React, { useEffect, useState } from 'react';

const DesignersPage = () => {
    const [designers, setDesigners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDesigners = async () => {
            try {
                const response = await fetch('https://api.example.com/designers');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDesigners(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDesigners();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>Designers</h1>
            <ul>
                {designers.map((designer) => (
                    <li key={designer.id}>{designer.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default DesignersPage;