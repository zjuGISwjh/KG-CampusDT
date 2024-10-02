import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';

const BusRouteList = ({onLabelClick}) => {
    //const { labels, loading, error } = getLabels();
    console.log("bus route list")
    const [routes, setRoutes] = useState([]);
    const colors = [
        '#4A90E2', // 柔和的蓝色
        '#50E3C2', // 柔和的绿松石色
        '#F5A623', // 温暖的橙色
        '#D0021B', // 温暖的红色
        '#7B92B5', // 中性的灰蓝色
        '#B8E0F8', // 浅蓝色
    ];

    const handleMenuClick = async (route) => {
        try {
            const response = await fetch(`http://localhost:8083/api/getBusStopByRoute?route=${route.name}`, {
                method: 'GET',
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("fetch bus stop success")
            console.log(data)
            onLabelClick(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const fetchRoutes = async () => {
          try {
              const response = await fetch('http://localhost:8083/api/getNodeByLabel?label=route',{
                  method: 'GET',
                  mode: 'cors'});
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const data = await response.json();
              console.log("routes:"+data)
              setRoutes(data); 
          } catch (err) {
            console.log("fail to fetch bus routes")
        }
      }
      fetchRoutes();
    },[])

    return (
        <div>
            <h3>Bus Routes</h3>
            <Menu style={{ display: 'flex', flexWrap: 'wrap',paddingTop:'0'}}>
                {routes.map((route,index) => (
                    <Menu.Item key={index} style={{ display: 'flex',width: "max-content",flex: '0 1 calc(50% - 8px)',
                        justifyContent: 'flex-start',paddingInline:"8px",
                        backgroundColor: colors[index % colors.length]
                    }}
                    onClick={() => handleMenuClick(route)}
                    >
                        <span style={{whiteSpace: 'nowrap'}}>Bus Route: {route.name}</span> {/* render route */}
                    </Menu.Item>
                ))}
            </Menu>
        </div>
    );
};

export default BusRouteList;