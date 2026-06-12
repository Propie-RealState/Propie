export const PROPERTY_STATUSES = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  RESERVED: "RESERVED",
  FINALIZED: "FINALIZED",
} as const;

export type PropertyLifecycleStatus =
  (typeof PROPERTY_STATUSES)[keyof typeof PROPERTY_STATUSES];

export const PUBLISHER_TYPES = {
  OWNER: "OWNER",
  AGENT: "AGENT",
} as const;

export type PublisherType =
  (typeof PUBLISHER_TYPES)[keyof typeof PUBLISHER_TYPES];

export const EXPLORE_VISIBLE_STATUSES: PropertyLifecycleStatus[] = [
  PROPERTY_STATUSES.ACTIVE,
  PROPERTY_STATUSES.PAUSED,
  PROPERTY_STATUSES.RESERVED,
];

/** SQL fragment — prepend table alias e.g. `p` */
export function exploreVisibilitySql(alias = "p"): string {
  return `
    ${alias}.published_at IS NOT NULL
    AND ${alias}.status IN ('ACTIVE', 'PAUSED', 'RESERVED')
  `;
}

export function operationsAllowedSql(alias = "p"): string {
  return `
    ${alias}.published_at IS NOT NULL
    AND ${alias}.status = 'ACTIVE'
  `;
}

export const PROPERTY_EVENT_TYPES = {
  PUBLISHED: "PROPERTY_PUBLISHED",
  STATUS_CHANGED: "PROPERTY_STATUS_CHANGED",
} as const;
