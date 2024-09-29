import React, { useEffect, useRef } from 'react';
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

const BusMap = ({busStops})=>{
    console.log("bus map")
    console.log("bus stops"+busStops)

    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
      if (busStops) {
        console.log("bus stop is not empty")
        //console.log(mapInstance.current.getLayers())
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
                color: 'rgba(255, 0, 0, 0.6)',
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
          //console.log("original map missing , render new map success")
        }
        //console.log("success")
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
          console.log("add layer")
          console.log(layers)
        }
    }
    else{
      console.log("bus stop is empty")
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
        console.log("bus stop is empty, success render default map")
        console.log(mapRef.current)
      }
      else{
        console.log("bus stop is empty, fail to render default map")
      }
    }

    // cleanup the map instance when the component unmounts
    return () => {
      // should not cleanup the map instance
      //with the origional function, when bus stop layer is added, the map instance will be cleared
        /*if (mapInstance.current) {
          mapInstance.current.setTarget(null);
        }*/
      };
    }, [busStops]);
      return(
        <div ref={mapRef} style={{height:"100%"}}/>
      )
}

export default BusMap;