import React, { useEffect, useRef,useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import { Circle,Text } from 'ol/style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { GeoJSON } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Select } from 'ol/interaction'
import Overlay from'ol/Overlay'
import { Card, Descriptions } from 'antd';

const BusMap = ({busStops})=>{
    console.log("bus map")
    console.log("bus stops"+busStops)

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const popupRef = useRef();
    const popupOverlay = useRef();
    const [properties, setProperties] = useState(null);

    useEffect(() => {

      // selected point style
      const selectedStyle = new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: 'red',
            }),
            stroke: new Stroke({
              color: 'black',
              width: 1,
            }),
          })
      });

      if (busStops) {
        var geojsonFormat = new GeoJSON();
        var features = geojsonFormat.readFeatures(busStops);

        var vectorSource = new VectorSource;
        vectorSource.addFeatures(features);

        const vectorLayer_bus_stop= new VectorLayer({
          source: vectorSource,
          style:new Style({
            image: new Circle({
              radius: 4,
              fill: new Fill({
                color: 'blue',
              }),
              stroke: new Stroke({
                color: 'black',
                width: 1,
              }),
            })
          })
        })

      // initial map
      //if(mapRef.current){
        if (!mapInstance.current) {
          mapInstance.current = new Map({
            target: mapRef.current,
            layers: [
              new TileLayer({
                source: new OSM(),
              }),
              vectorLayer_bus_stop
            ],
            view: new View({
                projection: 'EPSG:4326',
                center: [-96.340,30.622],
                zoom: 10,
            }),
          });
        }
        //}
        else{
          // clear old layer
          const layers = mapInstance.current.getLayers();
          console.log(layers)
          layers.forEach(layer => {
              if (layer instanceof VectorLayer) {
                  layers.remove(layer);
              }
          });
          mapInstance.current.addLayer(vectorLayer_bus_stop);
        }
    }
    else{
      // initial map
      if(mapRef.current){
        if (!mapInstance.current) {
          mapInstance.current = new Map({
            target: mapRef.current,
            layers: [
              new TileLayer({
                source: new OSM(),
              }),
            ],
            view: new View({
                projection: 'EPSG:4326',
                center: [-96.340,30.622],
                zoom: 10,
            }),
          });
        }
      }
      else{
        console.log("bus stop is empty, fail to render default map")
      }
    }

    const select = new Select({
      style: selectedStyle,
      // Only points
      // bus stops are multipoints
      /*filter: (feature) => {
          return feature.getGeometry().getType() === 'Point';
      }*/
    });

    mapInstance.current.addInteraction(select);
    // create overlay once
    if (!popupOverlay.current) {
      popupOverlay.current = new Overlay({
        element: popupRef.current,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
        //positioning: 'bottom-center',
      });
      mapInstance.current.addOverlay(popupOverlay.current);
    }
    //console.log(mapInstance.current.getOverlays());

  // select event
  const handleSelect = (event) => {
    const selectedFeatures = event.selected;
    const deselectedFeatures = event.deselected;

    if (selectedFeatures.length > 0) {
      const feature = selectedFeatures[0];
      const coordinates = feature.getGeometry().getCoordinates();
      const properties = feature.getProperties();

      setProperties(properties);

      popupOverlay.current.setPosition(coordinates);
      popupRef.current.style.display = 'block';
    }
    else{
      // clear properties, hide overlay
      setProperties(null);
      popupOverlay.current.setPosition(undefined);
    }

    /*if (deselectedFeatures.length > 0) {
      popupOverlay.current.setPosition(undefined);
    }*/
  };
  select.on('select', handleSelect);
    
    // cleanup the map instance when the component unmounts
    return () => {
      // should not cleanup the map instance
      //with the origional function, when bus stop layer is added, the map instance will be cleared
        /*if (mapInstance.current) {
          mapInstance.current.setTarget(null);
        }*/
          mapInstance.current.removeInteraction(select);
          select.un('select', handleSelect);
      };
    }, [busStops]);
      return(
        <div style={{ height: '100%' }}>
      <div ref={mapRef} style={{ height: '100%' }} />

      <div ref={popupRef} className="ol-popup" style={{ display: 'none', position: 'absolute', zIndex: 1000 }}>
        {properties && (
          <Card style={{ background: 'white', width: 300 }}>
            <h3 style={{ marginTop: '0' }}>Properties</h3>
            
            <Descriptions column={1} bordered>
              {Object.entries(properties)
                .filter(([key]) => key !== 'geometry')
                .map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value}
                  </Descriptions.Item>
                ))}
            </Descriptions>
          </Card>
        )}
      </div>
    </div>
      )
}

export default BusMap;