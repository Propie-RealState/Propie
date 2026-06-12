import { PROPERTY_EVENT_TYPES } from "../constants/property-status.constants";

export type PropertyEventType =
  (typeof PROPERTY_EVENT_TYPES)[keyof typeof PROPERTY_EVENT_TYPES];
