import axios from "axios";
import type { Place } from "@types";
import { getAuthHeaders } from "@helpers/getAuthHeaders";

export const fetchPlace = async (id: string): Promise<Place> => {
  const { data } = await axios.get<Place>(`/api/places/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};
