import React from 'react';
import { useState,useEffect } from 'react'
import 'antd'
import { Layout, Menu, Input } from 'antd';
import { BrowserRouter as Router, Route, Routes,Link } from 'react-router-dom';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import MyOnlineMap from './MyOnlineMap';
import LabelList from './LabelList';
import OnlineMapLabelList from './OnlineMapLabelList';
import './Main.css'
import NodeVisualization from './NodeVisualization';
import { Card, Descriptions } from 'antd';
import { useLocation } from 'react-router-dom';
import BusMap from './BusMap';
import BusRouteList from './BusRouteList';
import MapSearchComponent from './MapSearchComponent';
import BusSearchComponent from './BusSearchComponent';


const Home = () => <h2>campus digital twin</h2>;

const { Header, Sider, Content, Footer } = Layout;

const App = () => {
  // sidder-bar control
  const [collapsed, setCollapsed] = useState(false);

  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  const [nodes, setNodes] = useState([]); // nodes
  const [selectedLabel, setSelectedLabel] = useState(''); // selected label
  const [showVisualization, setShowVisualization] = useState(false); // load/unload nodevisualization component
  const [nodeDetails, setNodeDetails] = useState(null); // node properties
  const [labels, setLabels] = useState([]); // labels
  const [featureLabel, setFeatureLabel] = useState(''); // feature label
  const [featureDetails, setFeatureDetails] = useState(null); // feature properties
  const location = useLocation(); // current route
  const [busStops,setBusStops]=useState([]);

  // node visualization component
  const handleNodeUpdate = (fetchedNodes,label) => {
      setNodes(fetchedNodes);
      setSelectedLabel(label);
      setShowVisualization(true);
    };

  //update node detail
  const updateNodeDetails = (details) => {
    setNodeDetails(details);
  };

  const updataFeatureDetails=(label,details)=>{
    setFeatureLabel(label);
    setFeatureDetails(details);
  }

  //geo entities in /map
  const entityLabels = [
    "parkinglot",
    "building",
    "pavement",
    "construction",
    "bus_stop"
  ];

  const getLabels = async () => {
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

useEffect(() => {
  if (location.pathname === '/') {
    getLabels();
  }
}, [location]);

  // update labels when switch to /map 
  const handleMapClick = () => {
    setLabels(entityLabels);
    setShowVisualization(false);
  };

  const handleBusMapClick=()=>{
    setBusStops(null);
    setShowVisualization(false);
  }

  const updateBusStops=(busStops)=>{
    setBusStops(busStops);
    setShowVisualization(false);
  };

  /**console.log("Nodes:", nodes);
   * console.log("Selected Label:", selectedLabel);
   * console.log("details:", nodeDetails);
   */


  return (
    //<Router>
      <Layout style={{ minHeight: '100vh' }}>
        {/* navigation bar */}
        <Header style={{ background: '#500000', color:'white',display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          {/* menu and title */}
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <div className="trigger" style={{ paddingRight: '24px', cursor: 'pointer'}}>
              {collapsed ? <MenuUnfoldOutlined onClick={toggleSider} /> : <MenuFoldOutlined onClick={toggleSider} />}
            </div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>Digital Campus</h1>
          </div>

          {/* horizontal menu */}
          <Menu mode="horizontal" defaultSelectedKeys={['1']} style={{ flexGrow: 1, justifyContent: 'center', display: 'flex',background: '#500000' }}>
            <Menu.Item key="1" style={{color:'white'}}>
              <Link to="/" onClick={() => setShowVisualization(true)}>Knowledge Graph</Link>
            </Menu.Item>
            <Menu.Item key="2" style={{color:'white'}}>
              <Link to="/map" onClick={handleMapClick}>Base Map</Link>
            </Menu.Item>
            <Menu.Item key="3" style={{color:'white'}}>
              <Link to="/bus" onClick={handleBusMapClick}>Bus Map</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Layout key={location.pathname}>
          {/* left sider bar */}
          {/*{ location.pathname !== '/bus' && (*/}
            <Sider width={"20%"}>
              {location.pathname == '/' && (
                <div style={{ padding: '20px 20px' }}>
                  <LabelList labels={labels} onLabelClick={handleNodeUpdate} /> {/* render label list */}
                </div>
              )}
              {location.pathname == '/map' && (
                <div style={{ padding: '20px 20px' }}>
                  <OnlineMapLabelList labels={labels} onLabelClick={updataFeatureDetails}/> {/* render label list of map */}
                  {/*<div style={{ padding: '20px 0 0 0' }}>
                    <Input placeholder="parkinglot" prefix={<SearchOutlined />} />
                  </div>*/}
                  <h4>parkinglots on street</h4>
                  <MapSearchComponent />
                </div>
              )}
              {location.pathname == '/bus' && (
                <div style={{ padding: '20px 20px' }}>
                  <h4>next stops</h4>
                  <BusSearchComponent />
                </div>
              )}
            </Sider>
          {/*})}*/}
          <Layout style={{ padding: '0'}}>
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                background: '#fff',
              }}
            >
              {showVisualization && <NodeVisualization nodes={nodes} label={selectedLabel} updateNodeDetails={updateNodeDetails}/>} {/* pass/update parameters */}
              <Routes>
                <Route path="/" exact component={Home} />
                // React Router v6
                <Route path="/map" element={<MyOnlineMap onMapClick={updataFeatureDetails}/>} />
                <Route path="/bus" element={<BusMap busStops={busStops}/>} />
              </Routes>
            </Content>
            <Footer style={{ textAlign: 'center', display: 'block', maxHeight: '10%',padding:"10px 50px" }}>
              Knowledeg Driven Campus Digital Twin ©2024
            </Footer>
          </Layout>
          {/* collapsible sider bar for node/feature properties */}
          <Sider
            width={"25%"}
            collapsible
            collapsed={collapsed}
            onCollapse={toggleSider}
            style={{position:'fixed', right: 0,padding:0,backgroundColor:'transparent'}}
          >
            <div style={{ padding: '12px', maxHeight: '80vh', overflowY: 'auto' }}>
            {!collapsed && location.pathname=='/' && (
              <Card style={{ background: 'white'}}>
                <h3 style={{marginTop:"0"}}>Node Details</h3>
                {nodeDetails ? (
                  <Descriptions column={1} bordered>
                    {Object.entries(nodeDetails).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key}>
                        {value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : (
                  <div>No node selected</div>
                )}
              </Card>
            )}
            {!collapsed && location.pathname=='/map' && (
              <Card style={{ background: 'white'}}>
                <h3 style={{marginTop:"0"}}>Feature Details</h3>
                {featureLabel && <h4>Label: {featureLabel}</h4>}
                {featureDetails ? (
                  <Descriptions column={1} bordered>
                    {Object.entries(featureDetails).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key}>
                        {value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : (
                  <div>No feature selected</div>
                )}
              </Card>
            )}
            {!collapsed && location.pathname=='/bus' && (     
                <BusRouteList onLabelClick={updateBusStops}/>
            )}
            </div>
          </Sider>
        </Layout>
      </Layout>
    //</Router>
  );
};

// render APP in Router
const MainApp = () => (
  <Router>
    <App />
  </Router>
);

export default MainApp;
