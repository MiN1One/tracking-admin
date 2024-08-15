import throttle from 'lodash.throttle';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getTrackingWSConnection } from '../../config/api';
import { hasMinutesPassed } from '../../utility/date';
import { MapboxMap } from './Map';

const POINT_TEST_ID = 'test';
const POINT_UPDATE_INTERVAL = 2_000 // 2 sec;
const POINT_ACTIVE_DURATION_MINUTES = 5;
const POINT_ACTIVE_STATE_CHECK_INTERVAL = 1.5 * 60 * 1000; // 1 min 30 sec

const Tracking = () => {
  const [points, setPoints] = useState({});
  const authToken = useSelector((state) => state.auth.login);
  const [activeDriver, setActiveDriver] = useState(null);
  const pointsRef = useRef({});

  const togglePointActiveState = () => {
    Object.keys(pointsRef.current).forEach(driverId => {
      const point = pointsRef.current[driverId];
      if (
        point.active &&
        hasMinutesPassed(point.sent_time, POINT_ACTIVE_DURATION_MINUTES)
      ) {
        addPointToMap({ ...point, active: false });
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(
      togglePointActiveState,
      POINT_ACTIVE_STATE_CHECK_INTERVAL
    );
    return () => clearInterval(interval);
  }, []);

  const addPointToMap = useCallback((point) => {
    setPoints((prev) => {
      const newRecord = { ...prev };
      newRecord[point.driver_id || 'test'] = {
        ...point,
        driver_id: point.driver_id?.toString() || POINT_TEST_ID
      };
      pointsRef.current = newRecord;
      return newRecord;
    });
  }, []);

  useEffect(() => {
    (async () => {
      const socket = new WebSocket(getTrackingWSConnection(authToken));
      socket.onerror = (error) =>
        console.error('WebSocket error:', error);
      socket.onclose = () =>
        alert('Connection to server has closed');
      socket.onmessage = throttle((event) => {
        addPointToMap({
          ...JSON.parse(event.data),
          active: true
        });
      }, POINT_UPDATE_INTERVAL);
    })();
  }, [authToken, addPointToMap]);

  const pointsArr = useMemo(() => Object.values(points), [points]);

  return (
    <MapboxMap
      points={pointsArr}
      setActiveDriver={setActiveDriver}
      activeDriver={activeDriver}
      addPointToMap={addPointToMap}
      pointsRecord={points}
    />
  );
};

export default memo(Tracking);
