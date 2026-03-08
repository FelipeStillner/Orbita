import axios from "axios";
import { getAuthHeaders } from "../../../helpers/getAuthHeaders";

export interface InteractionPayload {
  liked?: boolean;
  hidden?: boolean;
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
