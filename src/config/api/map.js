import { axiosClient } from "./axios";

const mapToken = process.env.REACT_APP_MAPBOX_TOKEN;

export const getPlaceName = async (lng, lat) => {
  const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapToken}`;
  const { data } = await axiosClient(geocodingUrl)
  if (!data.features.length) return '';
  return data.features[0].place_name;
};