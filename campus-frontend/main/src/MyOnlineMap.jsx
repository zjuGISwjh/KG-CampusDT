import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import './Main.css'
import { Circle,Text } from 'ol/style';


//const url1='https://gis.tamu.edu/arcgis/rest/services/Testing/TAMU_BaseMap/MapServer/9/query?where=1=1&outFields=*&f=geojson&&returnGeometry=true';
//const url2='https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer/7/query?where=1=1&outFields=*&f=geojson&&returnGeometry=true';
const url_parkinglot='http://localhost:8083/api/getNodeAndGeometryByLabel?label=parkinglot';
const url_building='http://localhost:8083/api/getNodeAndGeometryByLabel?label=building';
const url_bus_stop='http://localhost:8083/api/getNodeAndGeometryByLabel?label=bus_stop';
const url_construction='http://localhost:8083/api/getNodeAndGeometryByLabel?label=construction';
const url_pavement='http://localhost:8083/api/getNodeAndGeometryByLabel?label=pavement';

const MyOnlineMap = ({onMapClick})=>{


    const handleFeatureClick = async(label,id) => {
        if (!id) {
          console.error("Node ID not found for label:", label);
          return;
      }
      try {
          const response = await fetch(`http://localhost:8083/api/getSingleNode?label=${label}&id=${id}`, {
              method: 'GET',
              mode: 'cors',
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const data = await response.json();
          console.log("Fetched data:", data);

          onMapClick(label,data[0])
      } catch (error) {
          console.error('Error fetching data:', error);
      }
    }
    
    const mapRef = useRef(null); // DOM node reference
    const mapInstance = useRef(null); // map instance
    const geoJSON_parkinglot=new VectorSource();
    const geoJSON_building=new VectorSource();
    const geoJSON_bus_stop=new VectorSource();
    const geoJSON_construction=new VectorSource();
    const geoJSON_pavement=new VectorSource();

    // fetch each api, get GeoJSONs
    fetch(url_building).then(response=>{
      if(response.ok){
          return response.json();
      }
    }).then(json=>{
      console.log(json);
      geoJSON_building.addFeatures(new GeoJSON().readFeatures(json))
    }).catch(error=>{
      console.error('Error fetching API:', error);
    })

    fetch(url_parkinglot).then(response=>{
      if(response.ok){
          return response.json();
      }
    }).then(json=>{
      console.log(json);
      geoJSON_parkinglot.addFeatures(new GeoJSON().readFeatures(json))
    }).catch(error=>{
      console.error('Error fetching API:', error);
    })

    fetch(url_construction).then(response=>{
      if(response.ok){
          return response.json();
      }
    }).then(json=>{
      console.log(json);
      geoJSON_construction.addFeatures(new GeoJSON().readFeatures(json))
    }).catch(error=>{
      console.error('Error fetching API:', error);
    })

    fetch(url_bus_stop).then(response=>{
      if(response.ok){
          return response.json();
      }
    }).then(json=>{
      console.log(json);
      geoJSON_bus_stop.addFeatures(new GeoJSON().readFeatures(json))
    }).catch(error=>{
      console.error('Error fetching API:', error);
    })

    fetch(url_pavement).then(response=>{
      if(response.ok){
          return response.json();
      }
    }).then(json=>{
      console.log(json);
      geoJSON_pavement.addFeatures(new GeoJSON().readFeatures(json))
    }).catch(error=>{
      console.error('Error fetching API:', error);
    })

    useEffect(() => {
      const vectorLayer_building = new VectorLayer({
          source: geoJSON_building,
          style: new Style({
            fill: new Fill({
              color: 'rgba(0, 255, 0, 0.5)',
            }),
            stroke: new Stroke({
              color: 'black',
              width: 1,
            }),
          }),
          name:"building"
        }
      );

      const vectorLayer_parkinglot = new VectorLayer({
        source: geoJSON_parkinglot,
        style: new Style({
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.5)',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 1,
          }),
        }),
        name:"parkinglot"
      });

      const vectorLayer_construction = new VectorLayer({
        source: geoJSON_construction,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.5)',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 1,
          }),
        }),
        name:"construction"
      });

      const vectorLayer_pavement = new VectorLayer({
        source: geoJSON_pavement,
        style: new Style({
          fill: new Fill({
            color: 'yellow',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 1,
          }),
        }),
        name:"pavement"
      });

      // point layer
      const vectorLayer_bus_stop= new VectorLayer({
        source: geoJSON_bus_stop,
        style:new Style({
          image: new Circle({
            radius: 2,
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
    if(mapRef.current){
      if (!mapInstance.current) {
        mapInstance.current = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
            vectorLayer_building,
            vectorLayer_parkinglot,
            vectorLayer_pavement,
            vectorLayer_construction,
            vectorLayer_bus_stop
          ],
          view: new View({
              projection: 'EPSG:4326',
              center: [-96.340,30.622],// college station,TX
              zoom: 10,
          }),
        });
      }
      console.log("success")
    }
    else{
      console.log("false")
    }
    // click to get feature properties
    mapInstance.current.on('click', function (evt) {
        mapInstance.current.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {
          const properties = feature.getProperties();
          const label=layer.values_.name
          const str=label+"_id"
          const id=properties[str]
          handleFeatureClick(label,id)
        });
      });
    // handle clicks on empty space
    mapInstance.current.on('click', function (evt) {
      const features = mapInstance.current.getFeaturesAtPixel(evt.pixel);
      if (features.length === 0) {
        alert("Clicked on empty space");
      }
    });
  
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
      }
    };
  }, []);
    return(
      <div ref={mapRef} style={{width: '100%',height:"100%"}}/>
    )
}

export default MyOnlineMap;