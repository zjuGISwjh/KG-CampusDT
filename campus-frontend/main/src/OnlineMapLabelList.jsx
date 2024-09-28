import React from 'react';
import { Menu } from 'antd';

const OnlineMapLabelList = ({labels,onLabelClick}) => {
    const colors = [
        '#4A90E2', // 柔和的蓝色
        '#50E3C2', // 柔和的绿松石色
        '#F5A623', // 温暖的橙色
        '#D0021B', // 温暖的红色
        '#7B92B5', // 中性的灰蓝色
        '#B8E0F8', // 浅蓝色
    ];

    const handleMenuClick = async (label) => {
        // render or clear layer of clicked label
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

export default OnlineMapLabelList;
