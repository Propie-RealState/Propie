import { apiFetch } from "../../../../lib/api";
import type { OwnedProperty } from "../types/my-properties.types";

export async function getMyProperties(): Promise<OwnedProperty[]> {
  return apiFetch("/properties/mine");
}
