import { getPlaceName } from "../config/api/map";
import { timeAgo } from "./date";

const PLACES_CACHE = {};

const getPopupContent = (properties, placeName) => `
  <div class="map__popup-content">
    <div class="map__head">
      <span class="map__driver">
        ${properties.fullName}
      </span>
      <span class="tag-label">
        Active
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
  date: point.sent_time
});