import { getPlaceName } from "../config/api/map";
import { timeAgo } from "./date";

export const renderPopupContent = async (map, popup, lng, lat, properties, mapContainer) => {
  const canvas = map.getCanvas();
  const placeName = await getPlaceName(lng, lat);
  canvas.style.cursor = 'pointer';
  const popupContent = `
    <div class="map__popup-content">
      <div class="map__head">
        <span class="map__driver">
          ${properties.fullName}
        </span>
        <span class="tag-label">
          Active
        </span>
      </div>
      <span class="map__place">${placeName}</span>
      <span class="map__time">${timeAgo(properties.date)}</span>
    </div>
  `;
  popup
    .setLngLat({ lng, lat })
    .setHTML(popupContent)
    .addTo(map);
  // const copyBtn = mapContainer.querySelector(
  //   `[data-id="${properties.id}"]`
  // );
  // copyBtn.onclick = () => copyToClipboard(`${lng}, ${lat}`);
}

export const onHoverMapPoint = async (map, popup, e, onFinishRender) => {
  const canvas = map.getCanvas();
  canvas.style.cursor = 'progress';
  const [{ properties }] = e.features;
  const { lng, lat } = e.lngLat;
  console.log(e);
  await renderPopupContent(map, popup, lng, lat, properties, e.target._container);
  canvas.style.cursor = 'pointer';
  onFinishRender(properties.id);
};

export const getPointProperties = (point) => ({
  fullName: point.full_name,
  id: point.driver_id,
  date: point.sent_time
});