import debounce from 'lodash.debounce';
import { Map, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import truckImage from '../../static/img/truck-3.png';
import { getPointProperties, onHoverMapPoint, renderPopupContent } from '../../utility/map';
import DriversList from './DriversList';

const SOURCE_NAME = 'track-source';
const ICON_NAME = 'truck';
const ICON_SIZE = .035;
const DEFAULT_ZOOM = 10;
const ACTIVE_POINT_ZOOM = 15;

const onHoverPoint = debounce(onHoverMapPoint, 1000);

export const MapboxMap = ({
  points = [],
  pointsRecord,
  setActiveDriver,
  activeDriver
}) => {
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
      focusAfterOpen: true,
    });

    popupRef.current.on('close', () => setActiveDriver(null));
    map.on('mouseenter', pointIds, (e) => onHoverPoint(map, popupRef.current, e, setActiveDriver));
    map.on('mouseleave', pointIds, () => onMouseLeavePoint(map));
  };

  const renderPopupForPoint = async (driverId, keepZoom) => {
    const point = pointsRecord[driverId];
    if (!point) return;
    await renderPopupContent(
      mapState,
      popupRef.current,
      point.longitude,
      point.latitude,
      getPointProperties(point),
      mapContainer.current
    );
    setActiveDriver(driverId);
    if (!keepZoom) {
      mapState.setCenter([point.longitude, point.latitude]);
      mapState.setZoom(ACTIVE_POINT_ZOOM);
    }
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
          properties: getPointProperties(point),
        })),
      };
      mapState.getSource(SOURCE_NAME)?.setData(newPoints);
    }
  }, [points, mapState]);

  useEffect(() => {
    if (activeDriver && mapState) {
      renderPopupForPoint(activeDriver, true);
    }
  }, [activeDriver, points, mapState]);

  useEffect(() => {
    if (!loadStartedRef.current && points.length) {
      loadStartedRef.current = true;

      const [firstPoint] = points;
      const mapInstance = new Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [firstPoint.longitude, firstPoint.latitude],
        zoom: DEFAULT_ZOOM,
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

  return (
    <div className="map" ref={mapContainer}>
      <DriversList
        activeDriver={activeDriver}
        renderPopupForPoint={renderPopupForPoint}
        pointsRecord={pointsRecord}
      />
    </div>
  );
};
