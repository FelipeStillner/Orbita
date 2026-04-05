import axios from "axios";
import type { Place } from "@types";
import { getAuthHeaders } from "@helpers/getAuthHeaders";

export const fetchPlace = async (
  id: string,
  lat?: number,
  lng?: number
): Promise<Place> => {
  const params: Record<string, string> = {};
  if (typeof lat === "number" && typeof lng === "number") {
    params.lat = String(lat);
    params.long = String(lng);
  }
  const { data } = await axios.get<Place>(`/api/places/${id}`, {
    params,
    headers: getAuthHeaders(),
  });
  return data;
};
