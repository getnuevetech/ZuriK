// Import necessary libraries
import React, { useEffect, useState } from 'react';

const FabricsPage = () => {
    const [fabrics, setFabrics] = useState([]);

    useEffect(() => {
        const fetchFabrics = async () => {
            try {
                const response = await fetch('/fabrics');
                const data = await response.json();
                setFabrics(data);
            } catch (error) {
                console.error('Error fetching fabrics:', error);
            }
        };

        fetchFabrics();
    }, []);

    return (
        <div>
            <h1>Fabrics</h1>
            <ul>
                {fabrics.map((fabric) => (
                    <li key={fabric.id}>{fabric.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default FabricsPage;