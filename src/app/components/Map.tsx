'use client'
import { useEffect, useRef, useState } from "react";
import mapboxgl, { Marker, Popup } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'; 

 
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY ?? '';

const Map = ({ data, fAsset, fBiz, fLat, fLng, setFAsset, setFBiz, setFLat, setFLng, reset }: { data: any, fAsset: any, fBiz: any, fLat: any, fLng: any, setFAsset: any, setFBiz: any, setFLat: any, setFLng: any, reset: any }) => {
  const mapContainer = useRef<any>(null);
  const [map, setMap] = useState<mapboxgl.Map>();
  const [zoom, setZoom] = useState(9);
  const [redraw, setRedraw] = useState(0);

  useEffect(() => {
    generateMap();
  }, [])

  useEffect(() => {
    if (!data) return;
    generateMap(true);
  }, [data])
  
  const setMapSource = async (mapObj: mapboxgl.Map, rd = redraw) => {
    mapObj.addSource(`places${rd}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data.map((d: { [x: string]: any; Lat: any; Long: any; }) => ({
          type: 'Feature',
          properties: {
            description: `<div><p><b>Business Category:</b> ${d?.["Business Category"]}</p> <p><b>Asset Name:</b> ${d?.["Asset Name"]}</p><p><b>Risk Rating: </b> ${d?.['Risk Rating']}</p><p><b>Location: </b> [${d?.['Long']+','+d?.['Lat']}]</p></div>`,
            risk: d?.['Risk Rating'],
            biz: d?.['Business Category'],
            ass: d?.['Asset Name'],
            lat: d?.Lat,
            lng: d?.Long,
          },
          geometry: {
            type: 'Point',
            coordinates: [d?.Long, d?.Lat]
          }
        }))
      }
    })
    
    const colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];
          
    const r1 = ['<', ['get', 'risk'], 0.3];
    const r2 = ['all', ['>=', ['get', 'risk'], 0.3], ['<', ['get', 'risk'], 0.5]];
    const r3 = ['all', ['>=', ['get', 'risk'], 0.5], ['<', ['get', 'risk'], 0.8]];
    const r4 = ['all', ['>=', ['get', 'risk'], 0.8], ['<', ['get', 'risk'], 1]];
    const r5 = ['>=', ['get', 'risk'], 5];

    mapObj.addLayer({
      id: `places${rd}`,
      type: 'circle',
      source: `places${rd}`,
      paint: {
        'circle-color': [
          'case',
          r1,
          colors[0],
          r2,
          colors[1],
          r3,
          colors[2],
          r4,
          colors[3],
          colors[4],
        ],
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }        
    })
    
      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      }); 

      console.log('loaded')
      
      mapObj.on('mouseenter', `places${rd}`, (e) => {
        // Change the cursor style as a UI indicator.
        mapObj.getCanvas().style.cursor = 'pointer';
        
        // Copy coordinates array.
        let coordinates;
        if (e?.features?.[0].geometry.type === 'Point') {
          coordinates = e?.features?.[0]?.geometry?.coordinates.slice();
        } else coordinates = [0, 0];
        const description = e?.features?.[0]?.properties?.description;
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat([coordinates[0], coordinates[1]]).setHTML(description).addTo(mapObj);
      });

      mapObj.on('click', `places${rd}`, (e) => {
        const prop = e?.features?.[0]?.properties;
        setFAsset(prop?.ass);
        setFBiz(prop?.biz);
        setFLat(prop?.lat);
        setFLng(prop?.lng);
      })
        
      mapObj.on('mouseleave', `places${rd}`, () => {
        mapObj.getCanvas().style.cursor = '';
        popup.remove();
      });
  }
  
  const reloadMap = async (map: mapboxgl.Map) => {
    
      map.removeLayer(`places${redraw}`)
      map.removeSource(`places${redraw}`)

      const rd = redraw + 1;
      await setMapSource(map, rd);
      setRedraw(rd);
      
      map.triggerRepaint();
      map.setCenter({ lat: data[0].Lat, lng: data[0].Long });
  }

  const generateMap = (retry = false) => {
    if (data.length < 1) return;
    if (map) {
      if (retry) {
        reloadMap(map)
      } 
      return;
    }
    console.log(fAsset, fBiz, fLat, fLng);
    const mapObj = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [data?.[0]?.Long, data?.[0]?.Lat],
      zoom: zoom
    });

    mapObj.on('load', async () => {
      await setMapSource(mapObj);       
    })

    setMap(mapObj)

  }
  return (
    <section className="map py-3" style={{marginTop: '63px'}}>
      <div className="map-container" ref={mapContainer}></div>
    </section>
  )
}
export default Map;