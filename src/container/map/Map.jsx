import { Map, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import truckImage from '../../static/img/truck-3.png';
import truckImageGrey from '../../static/img/truck-grey.png';
import { getPointProperties, isPointInBounds, loadPointImage, onHoverMapPoint, renderPopupContent } from '../../utility/map';
import DriversList from './DriversList';

const SOURCE_NAME = 'track-source';
const ICON_SIZE = .035;
const DEFAULT_ZOOM = 10;
const ACTIVE_POINT_ZOOM = 15;
const CURVE_DEPTH = 1.2;
const CURVE_SPEED = 1.75;
const MAP_STYLE = 'mapbox://styles/mapbox/streets-v11';

export const MapboxMap = ({
  points = [],
  pointsRecord,
  setActiveDriver,
  addPointToMap,
  activeDriver
}) => {
  const mapContainer = useRef(null);
  const popupRef = useRef(null);
  const loadStartedRef = useRef(false);
  const [mapState, setMapState] = useState(null);
  const [trackActive, setTrackActive] = useState(true);

  const renderInitialPoints = (map = mapState) => {
    const featurePoints = points.map((point) => ({
      type: 'Feature',
      id: point.driver_id,
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
      properties: getPointProperties(point)
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
          'icon-image': ['get', 'icon'],
          'icon-size': ICON_SIZE,
          'icon-allow-overlap': true,
          'symbol-sort-key': ['get', 'order']
        },
      });
    });
  };

  const onMouseLeavePoint = (map = mapState, removePopup) => {
    map.getCanvas().style.removeProperty('cursor');
    setActiveDriver(null);
    if (removePopup) {
      popupRef.current.remove();
    }
  };

  const attachEvents = (map = mapState) => {
    const pointIds = points.map(({ driver_id }) => driver_id);
    popupRef.current = new Popup({
      closeButton: true,
      closeOnClick: false,
      closeOnMove: false,
      maxWidth: 300,
      offset: 10,
      focusAfterOpen: true,
    });

    window.addEventListener('resize-map', () => setTimeout(() => map.resize(), 300));
    popupRef.current.on('close', () => onMouseLeavePoint(map));
    map.on('mouseleave', pointIds, () => onMouseLeavePoint(map, true));
    map.on('mouseenter', pointIds, (e) =>
      onHoverMapPoint(map, popupRef.current, e, setActiveDriver)
    );
  };

  const renderPopupForPoint = async (driverId, keepZoom) => {
    const point = pointsRecord[driverId];
    if (!point || !mapState) return;
    renderPopupContent(
      mapState,
      popupRef.current,
      point.longitude,
      point.latitude,
      getPointProperties(point),
    );
    setActiveDriver(driverId);
    if (!keepZoom) {
      mapState.flyTo({
        center: [point.longitude, point.latitude],
        zoom: ACTIVE_POINT_ZOOM,
        essential: true,
        curve: CURVE_DEPTH,
        speed: CURVE_SPEED,
      });
    }
  };

  useEffect(() => {
    if (mapState && points.length) {
      const newPoints = {
        type: 'FeatureCollection',
        features: points.map((point) => {
          return {
            type: 'Feature',
            id: point.driver_id,
            geometry: {
              type: 'Point',
              coordinates: [point.longitude, point.latitude],
            },
            properties: getPointProperties(point),
          }
        }),
      };
      mapState.getSource(SOURCE_NAME)?.setData(newPoints);
    }
  }, [points, mapState]);

  const trackActivePoint = () => {
    const point = pointsRecord[activeDriver];
    if (!mapState || !point) return;
    const { longitude, latitude } = point;
    if (isPointInBounds(longitude, latitude, mapState)) return;
    mapState.flyTo({
      center: [longitude, latitude],
      zoom: ACTIVE_POINT_ZOOM,
      essential: true,
      curve: CURVE_DEPTH,
      speed: CURVE_SPEED,
    });
  };

  useEffect(() => {
    if (activeDriver && mapState) {
      renderPopupForPoint(activeDriver, true);
    }
  }, [activeDriver, points, mapState]);

  useEffect(() => {
    if (trackActive) trackActivePoint();
  }, [trackActive, pointsRecord, activeDriver]);

  useEffect(() => {
    if (!loadStartedRef.current && points.length) {
      loadStartedRef.current = true;

      const [firstPoint] = points;
      const mapInstance = new Map({
        container: mapContainer.current,
        style: MAP_STYLE,
        center: [firstPoint.longitude, firstPoint.latitude],
        zoom: DEFAULT_ZOOM,
        accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
        attributionControl: false,
      });

      mapInstance.on('load', async () => {
        await loadPointImage(mapInstance, truckImage, 'active-point');
        await loadPointImage(mapInstance, truckImageGrey, 'inactive-point');
        renderInitialPoints(mapInstance);
        setMapState(mapInstance);
      });

      attachEvents(mapInstance);
    }
  }, [points.length]);

  return (
    <div className="map" ref={mapContainer}>
      <DriversList
        activeDriver={activeDriver}
        renderPopupForPoint={renderPopupForPoint}
        pointsRecord={pointsRecord}
        trackActive={trackActive}
        setTrackActive={setTrackActive}
        addPointToMap={addPointToMap}
      />
    </div>
  );
};
