import { Map, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';
import truckPng from '../../static/img/truck-1.png';
import { copyToClipboard } from '../../utility/browser';

const SOURCE_NAME = 'track-source';
const ICON_NAME = 'truck';
const ICON_SIZE = .035;

export const MapboxMap = ({ points = [] }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  const renderInitialPoints = () => {
    const featurePoints = points.map((point) => ({
      type: 'Feature',
      id: point.driver_id,
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        fullName: point.full_name,
      }
    }));

    mapRef.current.addSource(SOURCE_NAME, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: featurePoints,
      },
    });

    points.forEach((point) => {
      mapRef.current.addLayer({
        id: point.driver_id,
        type: 'symbol',
        source: SOURCE_NAME,
        layout: {
          'icon-image': ICON_NAME,
          'icon-size': ICON_SIZE,
          'icon-allow-overlap': true,
        },
      });
    });
  };

  const onHoverPoint = (e) => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
    const [firstFeature] = e.features;
    popupRef.current
      .setLngLat(e.lngLat)
      .setHTML(
        `<div>
          <span style="font-size:14px;">
            <strong>
            ${firstFeature.properties.fullName}
            </strong>
          </span>
          <br />
          <strong>
            ${`longtitude: ${e.lngLat.lng}, latitude: ${e.lngLat.lat}`}
          </strong>
          <br />
          Click to copy to clipboard
        </div>`,
      )
      .addTo(mapRef.current);
  };

  const onMouseLeavePoint = () => {
    mapRef.current.getCanvas().style.cursor = '';
    popupRef.current.remove();
  };

  const onClickPoint = (e) => {
    copyToClipboard(`longtitude: ${e.lngLat.lng}, latitude: ${e.lngLat.lat}`);
  };

  const attachMouseEvents = () => {
    const pointIds = points.map(({ driver_id }) => driver_id);
    popupRef.current = new Popup({
      closeButton: false,
      closeOnClick: false,
    });

    mapRef.current.on('mouseenter', pointIds, onHoverPoint);
    mapRef.current.on('mouseleave', pointIds, onMouseLeavePoint);
    mapRef.current.on('click', pointIds, onClickPoint);
  };

  useEffect(() => {
    if (mapRef.current && points.length) {
      const newPoints = {
        type: 'FeatureCollection',
        features: points.map((point) => ({
          type: 'Feature',
          id: point.driver_id,
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude],
          },
          properties: {
            fullName: point.full_name,
          },
        })),
      };
      mapRef.current.getSource(SOURCE_NAME)?.setData(newPoints);
    }
  }, [points]);

  useEffect(() => {
    if (points.length && !mapRef.current) {
      const [firstPoint] = points;
      const mapInstance = new Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [firstPoint.longitude, firstPoint.latitude],
        zoom: 9,
        accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
        attributionControl: false,
      });

      mapRef.current = mapInstance;

      mapInstance.on('load', () => {
        mapInstance.loadImage(truckPng, (error, image) => {
          if (error) throw error;
          mapInstance.addImage(ICON_NAME, image);
          renderInitialPoints();
        });
      });

      attachMouseEvents();
    }
  }, [points.length]);

  return <div ref={mapContainer} style={{ width: '100%', height: '90vh' }} />;
};
