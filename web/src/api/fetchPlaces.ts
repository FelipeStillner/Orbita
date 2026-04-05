import axios from "axios";
import type { PlacesListResponse, HomeResponse } from "@types";
import { getAuthHeaders } from "@helpers/getAuthHeaders";

/** Categories of nearby places with 6 places per category (for home). */
export const fetchListCategories = async (lat: number, lng: number) => {
  const { data } = await axios.get<HomeResponse>(`/api/places/home`, {
    params: { lat, long: lng },
    headers: getAuthHeaders(),
  });
  return data;
};

/** All places for one category, nearest first (no pagination). */
export const fetchListPlaces = async (
  lat: number,
  lng: number,
  category: string
) => {
  const { data } = await axios.get<PlacesListResponse>(`/api/places`, {
    params: { lat, long: lng, category },
    headers: getAuthHeaders(),
  });
  return data;
};

type SearchPlaceItem = {
  id?: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  tags?: string[];
  opening_hours?: string;
};

type SearchPlacesResponse = {
  places: SearchPlaceItem[];
};

export const fetchSearchPlaces = async (lat: number, lng: number, size?: number) => {
  const params: Record<string, number> = {
    lat,
    lon: lng,
  };

  if (typeof size === "number" && size > 0) {
    params.size = size;
  }

  const { data } = await axios.get<SearchPlacesResponse>(`/api/places/search`, {
    params,
    headers: getAuthHeaders(),
  });

  return data;
};
