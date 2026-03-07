import axios from "axios";
import type { FeatureCollection } from "../types";

const getAuthHeaders = () => {
  const googleToken = localStorage.getItem("auth_token");
  if (!googleToken) {
    throw new Error("No Google token found");
  }
  return {
    Authorization: `Bearer ${googleToken}`,
    "Content-Type": "application/json",
  } as const;
};

export const fetchPlaces = async (lat: number, lng: number, page: number) => {
  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng, page, limit: 5 },
    headers: getAuthHeaders(),
  });
  return data;
};

export interface InteractionPayload {
  liked?: boolean;
  disliked?: boolean;
  visited?: boolean;
  saved?: boolean;
}

export const sendInteraction = async (
  placeId: string,
  payload: InteractionPayload
) => {
  await axios.post(
    `/api/places/${placeId}/interaction`,
    payload,
    { headers: getAuthHeaders() }
  );
};
