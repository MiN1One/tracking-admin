import throttle from 'lodash.throttle';
import { memo, useEffect, useMemo, useState } from 'react';
import { MapboxMap } from '../../components/common/Map';
import { axiosClient, getTrackingWSConnection } from '../../config/api';

const CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'Asilbek2001',
};

const POINT_TEST_ID = 'test';

const Tracking = () => {
  const [points, setPoints] = useState({
    'test1': {
      latitude: 41.325067,
      longitude: 69.243680,
      driver_id: 'test1',
      full_name: 'Test',
    },
    'test2': {
      latitude: 41.329579,
      longitude: 69.184457, 
      driver_id: 'test2',
      full_name: 'Test',
    },
    'test3': {
      latitude: 41.330636,
      longitude: 69.337790, 
      driver_id: 'test3',
      full_name: 'Test',
    },
  });

  useEffect(() => {
    (async () => {
      const { data } = await axiosClient('login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(CREDENTIALS),
      });

      const socket = new WebSocket(getTrackingWSConnection(data.token));
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
            driver_id: point.driver_id || POINT_TEST_ID
          };
          return newRecord;
        });
      }, 2000);
    })();
  }, []);

  const pointsArr = useMemo(() => Object.values(points), [points]);

  return <MapboxMap points={pointsArr} />;
};

export default memo(Tracking);
