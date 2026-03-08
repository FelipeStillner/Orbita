import axios from "axios";
import { getAuthHeaders } from "../../../helpers/getAuthHeaders";

export interface Collection {
  id: string;
  name: string;
}

export const fetchCollections = async (): Promise<Collection[]> => {
  const { data } = await axios.get<Collection[]>("/api/collections", {
    headers: getAuthHeaders(),
  });
  return data;
};

export const createCollection = async (name: string): Promise<Collection> => {
  const { data } = await axios.post<Collection>(
    "/api/collections",
    { name },
    { headers: getAuthHeaders() }
  );
  return data;
};

export const addPlaceToCollection = async (
  collectionId: string,
  placeId: string
): Promise<void> => {
  await axios.post(
    `/api/collections/${collectionId}/places`,
    { place_id: placeId },
    { headers: getAuthHeaders() }
  );
};

export const removePlaceFromCollection = async (
  collectionId: string,
  placeId: string
): Promise<void> => {
  await axios.delete(
    `/api/collections/${collectionId}/places/${placeId}`,
    { headers: getAuthHeaders() }
  );
};
