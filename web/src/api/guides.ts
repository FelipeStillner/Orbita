import axios from "axios";
import { getAuthHeaders } from "@helpers/getAuthHeaders";

const auth = () => ({ headers: getAuthHeaders() });

export interface GuideListItem {
  id: string;
  title: string;
  step_count: number;
  place_count: number;
}

export interface GuideStepPlace {
  place_id: string;
  name: string;
  lat: number;
  lon: number;
  option_note: string;
  position: number;
  /** First/primary image URL for this place, when available */
  primary_image_url?: string;
  /** All image URLs for this place (order: primary first, then by created_at) */
  image_urls?: string[];
  tags?: string[];
  photo_count?: number;
  like_count?: number;
  is_open_now?: boolean;
}

export interface GuideStep {
  id: string;
  position: number;
  step_title: string;
  step_note: string;
  places: GuideStepPlace[];
  step_index: number;
}

export interface GuideDetail {
  id: string;
  title: string;
  blurb: string;
  cover_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  /** API may send `null` for empty guides (Go nil slice). */
  steps: GuideStep[] | null;
}

export const fetchGuides = async (): Promise<GuideListItem[]> => {
  const { data } = await axios.get<GuideListItem[]>("/api/guides", auth());
  return data;
};

export const fetchGuide = async (guideId: string): Promise<GuideDetail> => {
  const { data } = await axios.get<GuideDetail>(`/api/guides/${guideId}`, auth());
  return data;
};

export const createGuide = async (title: string): Promise<{ id: string; title: string }> => {
  const { data } = await axios.post<{ id: string; title: string }>(
    "/api/guides",
    { title, blurb: "", cover_url: "", tags: [] },
    auth()
  );
  return data;
};

export type PatchGuideBody = {
  title?: string;
  blurb?: string;
  cover_url?: string;
  tags?: string[];
};

export const patchGuide = async (
  guideId: string,
  body: PatchGuideBody
): Promise<{ id: string; title: string }> => {
  const { data } = await axios.patch<{ id: string; title: string }>(
    `/api/guides/${guideId}`,
    body,
    auth()
  );
  return data;
};

export const patchGuideStep = async (
  guideId: string,
  stepId: string,
  body: { step_title: string; step_note: string }
): Promise<void> => {
  await axios.patch(`/api/guides/${guideId}/steps/${stepId}`, body, auth());
};

export const patchGuidePlaceOption = async (
  guideId: string,
  stepId: string,
  placeId: string,
  option_note: string
): Promise<void> => {
  await axios.patch(
    `/api/guides/${guideId}/steps/${stepId}/places/${placeId}`,
    { option_note },
    auth()
  );
};

export const deleteGuide = async (guideId: string): Promise<void> => {
  await axios.delete(`/api/guides/${guideId}`, auth());
};

/** Appends a new step at the end of the guide (use from guide detail only). */
export const createGuideStep = async (
  guideId: string,
  opts?: { step_title?: string; step_note?: string }
): Promise<{ id: string; position: number }> => {
  const { data } = await axios.post<{ id: string; position: number }>(
    `/api/guides/${guideId}/steps`,
    {
      step_title: opts?.step_title ?? "",
      step_note: opts?.step_note ?? "",
    },
    auth()
  );
  return data;
};

export const addPlaceToGuideStep = async (
  guideId: string,
  stepId: string,
  placeId: string,
  opts?: { option_note?: string }
): Promise<void> => {
  const body: Record<string, string> = { place_id: placeId };
  if (opts?.option_note?.trim()) body.option_note = opts.option_note.trim();
  await axios.post(
    `/api/guides/${guideId}/steps/${stepId}/places`,
    body,
    auth()
  );
};

export const removePlaceFromGuide = async (
  guideId: string,
  placeId: string
): Promise<void> => {
  await axios.delete(`/api/guides/${guideId}/places/${placeId}`, auth());
};

/** Removes the place from this step only (not other steps in the same guide). */
export const removePlaceFromGuideStep = async (
  guideId: string,
  stepId: string,
  placeId: string
): Promise<void> => {
  const res = await axios.delete(
    `/api/guides/${guideId}/steps/${stepId}/places/${placeId}`,
    {
      ...auth(),
      validateStatus: (s) => s >= 200 && s < 300,
    }
  );
  const ct = res.headers["content-type"];
  const ctStr = typeof ct === "string" ? ct : "";
  if (ctStr.includes("text/html")) {
    throw new Error(
      "Remove failed: got an HTML page instead of the API (check dev server proxy and API routes)."
    );
  }
  if (res.status !== 204) {
    throw new Error(`Remove failed: expected 204, got ${res.status}`);
  }
};
