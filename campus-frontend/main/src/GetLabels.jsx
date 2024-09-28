import { useEffect, useState } from 'react';

const getLabels = () => {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const response = await fetch('http://localhost:8083/api/getAllLabel',{
                    method: 'GET',
                    mode: 'cors'});
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("data:"+data)
                setLabels(data); 
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLabels();
    }, []); // empty dependency array, ensures the function is called only once on component mount

    return { labels, loading, error };
};

export default getLabels;
