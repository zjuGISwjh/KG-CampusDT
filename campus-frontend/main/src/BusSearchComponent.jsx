import React, { useState } from 'react';
import { Input, Button, List, Spin, Alert } from 'antd';

const { Search } = Input;

const  BusSearchComponent = () => {
    const [routeName, setRouteName] = useState('');
    const [currentStop, setCurrentStop] = useState('');
    const [remainingStops, setRemainingStops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!routeName || !currentStop) {
            setError('please enter route and current stop name');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8083/api/getNextStops?route=${routeName}&busStopName=${currentStop}`);
            if (!response.ok) throw new Error('Network Error');
            const data = await response.json();
            setRemainingStops(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2 inputs, 2 parameters
    return (
        <div>
            <Input
                placeholder="route name"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                style={{ marginBottom: '10px' }}
            />
            <Input
                placeholder="current bus stop name"
                value={currentStop}
                onChange={(e) => setCurrentStop(e.target.value)}
                style={{ marginBottom: '10px' }}
            />
            <Button type="primary" onClick={handleSearch} loading={loading}>
                get remaining stops
            </Button>
            {error && <Alert message={error} type="error" showIcon style={{ marginTop: '10px' }} />}
            <div style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '10px' }}>
                <List
                    bordered
                    dataSource={remainingStops}
                    renderItem={(item) => (
                        <List.Item key={item.bus_stop_id}>{item.name}</List.Item>
                    )}
                />
            </div>
        </div>
    );
};
export default BusSearchComponent;
