import throttle from 'lodash.throttle';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getTrackingWSConnection } from '../../config/api';
import { MapboxMap } from './Map';

const POINT_TEST_ID = 'test';
const POINT_UPDATE_INTERVAL = 2000;

const Tracking = () => {
  const [points, setPoints] = useState({});
  const authToken = useSelector((state) => state.auth.login);
  const [activeDriver, setActiveDriver] = useState(null);

  useEffect(() => {
    (async () => {
      const socket = new WebSocket(getTrackingWSConnection(authToken));
      socket.onerror = (error) =>
        console.error('WebSocket error:', error);
      socket.onclose = () =>
        alert('Connection to server has closed');

      socket.onmessage = throttle((event) => {
        const point = JSON.parse(event.data);
        setPoints((prev) => {
          const newRecord = { ...prev };
          newRecord[point.driver_id || 'test'] = {
            ...point,
            driver_id: point.driver_id?.toString() || POINT_TEST_ID
          };
          return newRecord;
        });
      }, POINT_UPDATE_INTERVAL);
    })();
  }, [authToken]);

  const pointsArr = useMemo(() => Object.values(points), [points]);

  return (
    <MapboxMap
      points={pointsArr}
      setActiveDriver={setActiveDriver}
      activeDriver={activeDriver}
      pointsRecord={points}
    />
  );
};

export default memo(Tracking);
