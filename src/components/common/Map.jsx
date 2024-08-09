import debounce from 'lodash.debounce';
import { Map, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { getPlaceName } from '../../config/api/map';
import truckImage from '../../static/img/truck-1.png';
import { copyToClipboard } from '../../utility/browser';
import { timeAgo } from '../../utility/date';

const SOURCE_NAME = 'track-source';
const ICON_NAME = 'truck';
const ICON_SIZE = .035;

const onHoverPoint = debounce(async (map, popup, e) => {
  const canvas = map.getCanvas();
  canvas.style.cursor = 'progress';
  const [{ properties }] = e.features;
  const { lng, lat } = e.lngLat;
  const placeName = await getPlaceName(lng, lat);
  canvas.style.cursor = 'pointer';
  popup
    .setLngLat(e.lngLat)
    .setHTML(
      `<div class="map__popup-content">
        <div class="map__head">
          <span class="map__driver">
            ${properties.fullName}
          </span>
          <button class="map__copy" data-id="${properties.id}">
            Copy
          </button>
        </div>
        <span class="map__place">${placeName}</span>
        <span class="map__time">${timeAgo(properties.date)}</span>
      </div>`,
    )
    .addTo(map);
  const copyBtn = e.target._container.querySelector(
    `[data-id="${properties.id}"]`
  );
  copyBtn.onclick = () => copyToClipboard(`${lng}, ${lat}`);
}, 1000);

export const MapboxMap = ({ points = [] }) => {
  const mapContainer = useRef(null);
  const popupRef = useRef(null);
  const loadStartedRef = useRef(false);
  const [mapState, setMapState] = useState(null);

  const renderInitialPoints = (map = mapState) => {
    const featurePoints = points.map((point) => ({
      type: 'Feature',
      id: point.driver_id,
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        fullName: point.full_name,
        id: point.driver_id,
        date: point.sent_time
      }
    }));

    map.addSource(SOURCE_NAME, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: featurePoints,
      },
    });

    points.forEach((point) => {
      map.addLayer({
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

  const onMouseLeavePoint = (map = mapState) => {
    map.getCanvas().style.cursor = '';
  };

  const attachMouseEvents = (map = mapState) => {
    const pointIds = points.map(({ driver_id }) => driver_id);
    popupRef.current = new Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: 300,
      offset: 10,
      focusAfterOpen: true
    });

    map.on('mouseenter', pointIds, (e) => onHoverPoint(map, popupRef.current, e));
    map.on('mouseleave', pointIds, () => onMouseLeavePoint(map));
  };

  useEffect(() => {
    if (mapState && points.length) {
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
            id: point.driver_id,
            date: point.sent_time
          },
        })),
      };
      mapState.getSource(SOURCE_NAME)?.setData(newPoints);
    }
  }, [points, mapState]);

  useEffect(() => {
    if (!loadStartedRef.current && points.length) {
      loadStartedRef.current = true;

      const [firstPoint] = points;
      const mapInstance = new Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [firstPoint.longitude, firstPoint.latitude],
        zoom: 9,
        accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
        attributionControl: false,
      });
      mapInstance.on('load', () => {
        renderInitialPoints(mapInstance);
        setMapState(mapInstance);
        mapInstance.loadImage(truckImage, (error, image) => {
          if (error) throw error;
          mapInstance.addImage(ICON_NAME, image);
        });
      });

      attachMouseEvents(mapInstance);
    }
  }, [points.length]);

  return <div ref={mapContainer} style={{ width: '100%', height: '90vh' }} />;
};
