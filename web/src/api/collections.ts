import axios from "axios";
import { getAuthHeaders } from "@helpers/getAuthHeaders";

export interface Collection {
  id: string;
  name: string;
  place_count?: number;
}

export interface CollectionPlace {
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

export const deleteCollection = async (collectionId: string): Promise<void> => {
  await axios.delete(`/api/collections/${collectionId}`, {
    headers: getAuthHeaders(),
  });
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

export const fetchCollectionPlaces = async (
  collectionId: string
): Promise<CollectionPlace[]> => {
  const { data } = await axios.get<CollectionPlace[]>(
    `/api/collections/${collectionId}/places`,
    { headers: getAuthHeaders() }
  );
  return data;
};
