import React, { useState } from 'react';
import { Input, Button, List, Spin, Alert } from 'antd';

const { Search } = Input;

const MapSearchComponent = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (value) => {
        setQuery(value);
        try {
            const response = await fetch(`http://localhost:8083/api/getParkinglotOnStreet?street=${value}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // scenario implement: get the parkinglots on street
    return (
        <div>
            <Search 
                placeholder="street name" 
                enterButton="Search" 
                size="large" 
                onSearch={handleSearch} 
                loading={loading}
            />
            {error && <Alert message={error} type="error" showIcon style={{ marginTop: '10px' }} />}
            {loading && <Spin style={{ marginTop: '10px' }} />}
            <div style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '10px' }}>
                <List
                    bordered
                    dataSource={results}
                    renderItem={(item, index) => (
                        <List.Item key={index}>{item.name}</List.Item>
                    )}
                    style={{ marginTop: '10px' }}
                />
            </div>
        </div>
    );
};

export default MapSearchComponent;
