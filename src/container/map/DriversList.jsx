import { Center, Flex } from '@chakra-ui/react';
import { Input, notification, Spin, Switch } from 'antd';
import axios from 'axios';
import Icon from 'feather-icons-react';
import debounce from 'lodash.debounce';
import { memo, useEffect, useRef, useState } from 'react';
import { axiosClient } from '../../config/api';
import { copyToClipboard } from '../../utility/browser';
import { Contact } from './Contact';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

const DriversList = ({
  activeDriver,
  pointsRecord,
  renderPopupForPoint,
  trackActive,
  setTrackActive,
  addPointToMap,
}) => {
  const [loading, setLoading] = useState(false);
  const [driversList, setDriversList] = useState([]);
  const listRef = useRef(null);
  const [search, setSearch] = useState('');
  const [activeDriverContact, setActiveDriverContact] = useState(null);
  const [transparentWindow, setTransparentWindow] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [loadingAction, setLoadingAction] = useState(false);

  const openNotification = (description, message = 'Copied the coordinates',) => {
    api.info({
      message,
      description,
      placement: 'bottomRight',
    });
  };

  const addDriversLastPoint = (drivers) => {
    drivers.forEach((driver) => {
      if (driver.id in pointsRecord) return;
      addPointToMap({
        driver_id: driver.id,
        longitude: driver.last_known_location?.longitude,
        latitude: driver.last_known_location?.latitude,
        full_name: driver.full_name,
        sent_time: driver.last_known_location?.timestamp,
        active: driver.is_online,
        timezone: driver.last_known_location?.timezone,
      });
    });
  };

  const onSendAction = async (action, driverId = activeDriverContact) => {
    try {
      setLoadingAction(true);
      await axios.post(`${API_ENDPOINT}custom-update/`, {
        action,
        driver_id: driverId,
      });
      openNotification('Successfully sent action', `Driver ID: ${driverId}`);
    } catch (er) {
      console.error('Error sending contact action to driver: ', er);
    } finally {
      setLoadingAction(false);
    }
  };

  const fetchDrivers = useRef(
    debounce(async (search) => {
      try {
        const trimmedSearch = search.trim();
        setLoading(true);
        const { data: driversList } = await axiosClient(`drivers/${trimmedSearch ? `?search=${trimmedSearch}` : ''}`);
        if (driversList?.length) {
          setDriversList(driversList);
          addDriversLastPoint(driversList);
        }
      } catch (er) {
        console.error('Error fetching drivers', er);
      } finally {
        setLoading(false);
      }
    }, 700),
  );

  useEffect(() => {
    if (activeDriver) {
      document.querySelector(`[data-driver-id="${activeDriver}"]`)
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeDriver]);

  const onCopyCoordinates = (e, point) => {
    e.stopPropagation();
    const coords = `${point.latitude}, ${point.longitude}`;
    copyToClipboard(coords);
    openNotification(coords);
  };

  useEffect(() => {
    fetchDrivers.current(search);
  }, [search]);

  const driverEls = driversList.map((driver) => {
    const point = pointsRecord[driver.id];
    return (
      <li
        key={driver.id}
        tabIndex={0}
        onClick={() => renderPopupForPoint(driver.id)}
        className="drivers__item"
        data-active={activeDriver == driver.id}
        data-disabled={!point}
        data-driver-id={driver.id}
      >
        {driver.full_name}
        <Flex alignItems="center" gap="5px">
          <span className={`tag-label ${!point?.active ? 'tag-label--danger' : ''}`}>
            {point?.active ? 'Active' : 'Inactive'}
          </span>
          <button className="btn-plain" onClick={(e) => onCopyCoordinates(e, point)} title="Copy coordinates">
            <Icon icon="copy" />
          </button>
          <button className="btn-plain" onClick={() => setActiveDriverContact(driver.id)} title="Alert Driver">
            <Icon icon="phone-call" />
          </button>
          <button
            className="btn-plain"
            disabled={loadingAction}
            onClick={() => onSendAction('reload', driver.id)}
            title="Reload"
          >
            <Icon icon="loader" />
          </button>
        </Flex>
      </li>
    );
  });

  return (
    <div className={`drivers ${transparentWindow ? 'drivers--pale' : ''}`}>
      {contextHolder}
      <Contact
        loading={loadingAction}
        onSendAction={onSendAction}
        activeDriverContact={activeDriverContact}
        setActiveDriverContact={setActiveDriverContact}
        pointsRecord={pointsRecord}
      />
      <div className="drivers__head">
        <span>Drivers List</span>
        <Flex alignItems="center" justifyContent="space-between">
          <Flex gap="5px" alignItems="center">
            Track Active
            <Switch checked={trackActive} onChange={setTrackActive} title="Track active driver as it moves" />
          </Flex>
          <Flex gap="5px" alignItems="center">
            Pale Window
            <Switch
              checked={transparentWindow}
              onChange={setTransparentWindow}
              title={transparentWindow ? 'Sharp window' : 'Pale window'}
            />
          </Flex>
        </Flex>
      </div>
      <form>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="drivers__search"
          placeholder="Search"
          type="search"
          prefix={<Icon icon="search" className="icon-sm" />}
        />
      </form>
      {loading ? (
        <Center minHeight="300px">
          <Spin />
        </Center>
      ) : (
        <>
          <ul ref={listRef} className="custom-scroll">
            {driverEls}
          </ul>
        </>
      )}
    </div>
  );
};

export default memo(DriversList);
