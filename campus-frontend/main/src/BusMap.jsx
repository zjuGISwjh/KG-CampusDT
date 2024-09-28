import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const BusMap = ()=>{
    console.log("bus map")

    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {

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
        console.log("success")
      }
      else{
        console.log("false")
      }

    // cleanup the map instance when the component unmounts
    return () => {
        if (mapInstance.current) {
          mapInstance.current.setTarget(null);
        }
      };
    }, []);
      return(
        <div ref={mapRef} style={{height:"100%"}}/>
      )
}

export default BusMap;