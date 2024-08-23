import { getPlaceName } from "../config/api/map";
import { timeAgo } from "./date";

const PLACES_CACHE = {};

const getPopupContent = (properties, placeName) => `
  <div class="map__popup-content">
    <div class="map__head">
      <span class="map__driver">
        ${properties.fullName}
      </span>
      <span class="tag-label${properties.active ? '' : ' tag-label--danger'}">
        ${properties.active ? 'Active' : 'Inactive'}
      </span>
    </div>
    <span class="map__place">${placeName || PLACES_CACHE[properties.id] || ''}</span>
    <span class="map__time">${timeAgo(properties.date)}</span>
  </div>
`;

export const renderPopupContent = (map, popup, lng, lat, properties) => {
  const canvas = map.getCanvas();
  canvas.style.cursor = 'pointer';
  const popupContent = getPopupContent(properties);
  popup
    .setLngLat({ lng, lat })
    .setHTML(popupContent)
    .addTo(map);
  getPlaceName(lng, lat).then(placeName => {
    popup.setHTML(getPopupContent(properties, placeName));
    PLACES_CACHE[properties.id] = placeName;
  });
}

export const isPointInBounds = (lng, lat, map) => {
  const bounds = map.getBounds();
  return (
    lng >= bounds.getWest() &&
    lng <= bounds.getEast() &&
    lat >= bounds.getSouth() &&
    lat <= bounds.getNorth()
  );
};

export const loadPointImage = (map, imageSrc, imageName) => {
  return new Promise((res, rej) => {
    map.loadImage(imageSrc, (error, image) => {
      if (error) rej(error);
      map.addImage(imageName, image);
      res(imageName);
    });
  });
};

export const onHoverMapPoint = async (map, popup, e, onFinishRender) => {
  if (!e) return;
  const canvas = map.getCanvas();
  canvas.style.cursor = 'progress';
  const [{ properties }] = e?.features;
  const { lng, lat } = e.lngLat;
  renderPopupContent(map, popup, lng, lat, properties);
  canvas.style.cursor = 'pointer';
  onFinishRender(properties.id);
};

export const getPointProperties = (point) => ({
  fullName: point.full_name,
  id: point.driver_id,
  date: point.sent_time,
  active: point.active,
  icon: point.active ? 'active-point' : 'inactive-point',
  order: point.active ? 99 : 1,
  rotation: parseFloat(point.bearing),
});