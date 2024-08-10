import { Center, Flex } from "@chakra-ui/react";
import { Spin } from "antd";
import Icon from 'feather-icons-react';
import debounce from 'lodash.debounce';
import { memo, useEffect, useRef, useState } from "react";
import { axiosClient } from "../../config/api";
import { copyToClipboard, findElPosition } from "../../utility/browser";

const DriversList = ({ activeDriver, pointsRecord, renderPopupForPoint }) => {
  const [loading, setLoading] = useState(false);
  const [driversList, setDriversList] = useState([]);
  const listRef = useRef(null);
  const [search, setSearch] = useState('');

  const fetchDrivers = useRef(
    debounce(async (search) => {
      try {
        const trimmedSearch = search.trim();
        setLoading(true);
        const { data: driversList } = await axiosClient(
          `drivers/${trimmedSearch ? `?search=${trimmedSearch}` : ''}`
        );
        if (driversList?.length) {
          setDriversList(driversList);
        }
      } catch (er) {
        console.error('Error fetching drivers', er);
      } finally {
        setLoading(false);
      }
    }, 700)
  );

  useEffect(() => {
    if (activeDriver) {
      listRef.current.scrollTo({
        top: findElPosition(`[data-driver-id="${activeDriver}"]`),
        behavior: 'smooth'
      });
    }
  }, [activeDriver]);

  const onCopyCoordinates = (e, point) => {
    e.stopPropagation();
    copyToClipboard(`${point.longitude}, ${point.latitude}`);
  };

  useEffect(() => {
    fetchDrivers.current(search);
  }, [search]);

  const driverEls = driversList.map(driver => {
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
          <span className={`tag-label ${!point ? 'tag-label--danger' : ''}`}>
            {point ? 'Active' : 'Inactive'}
          </span>
          {point && (
            <button
              className="btn-plain"
              onClick={(e) => onCopyCoordinates(e, point)}
              title="Copy coordinates"
            >
              <Icon icon="copy" />
            </button>
          )}
        </Flex>
        {/* `${point.longitude} ${point.latitude}` */}
      </li>
    );
  });

  return (
    <div className="drivers">
      <span className="drivers__label">Drivers List</span>
      <form>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="drivers__search"
          placeholder="Search"
          type="search"
        />
      </form>
      {loading ? (
        <Center minHeight="300px">
          <Spin />
        </Center>
      ) : (
        <>
          <ul ref={listRef} className="custom-scroll">{driverEls}</ul>
        </>
      )}
    </div>
  );
};

export default memo(DriversList);