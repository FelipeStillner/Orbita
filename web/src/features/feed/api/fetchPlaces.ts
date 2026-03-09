import axios from "axios";
import type { PlacesResponse } from "../types";
import { getAuthHeaders } from "../../../helpers/getAuthHeaders";

export const fetchPlaces = async (lat: number, lng: number, page: number) => {
    const { data } = await axios.get<PlacesResponse>(`/api/places`, {
        params: { lat, long: lng, page, limit: 5 },
        headers: getAuthHeaders(),
    });
    return data;
};
