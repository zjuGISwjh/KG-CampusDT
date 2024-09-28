// LabelList.jsx
import React from 'react';
import { Menu } from 'antd';

const LabelList = ({labels,onLabelClick}) => {
    //const { labels, loading, error } = getLabels();
    const colors = [
        '#4A90E2', // 柔和的蓝色
        '#50E3C2', // 柔和的绿松石色
        '#F5A623', // 温暖的橙色
        '#D0021B', // 温暖的红色
        '#7B92B5', // 中性的灰蓝色
        '#B8E0F8', // 浅蓝色
    ];

    const handleMenuClick = async (label) => {
        try {
            const response = await fetch(`http://localhost:8083/api/getNodeByLabel?label=${label}`, {
                method: 'GET',
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("fetch nodes success")
            console.log(data)
            onLabelClick(data,label);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <Menu style={{ display: 'flex', flexWrap: 'wrap'}}>
            {labels.map((label,index) => (
                <Menu.Item key={index} style={{ display: 'flex',width: "max-content",
                    justifyContent: 'flex-start',paddingInline:"8px",
                    backgroundColor: colors[index % colors.length]
                }}
                onClick={() => handleMenuClick(label)}
                >
                    <span style={{whiteSpace: 'nowrap'}}>{label}</span> {/* render label */}
                </Menu.Item>
            ))}
        </Menu>
    );
};

export default LabelList;
