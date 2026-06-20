export const PROPERTY_COMMERCIALIZATION_MODES = {
  WITH_AGENTS: "WITH_AGENTS",
  WITHOUT_INTERMEDIARIES: "WITHOUT_INTERMEDIARIES",
} as const;

export type PropertyCommercializationMode =
  (typeof PROPERTY_COMMERCIALIZATION_MODES)[keyof typeof PROPERTY_COMMERCIALIZATION_MODES];

export const DEFAULT_COMMERCIALIZATION_MODE: PropertyCommercializationMode =
  PROPERTY_COMMERCIALIZATION_MODES.WITH_AGENTS;

export function acceptsAgentParticipationSql(
  commercializationAlias = "pc",
): string {
  return `COALESCE(${commercializationAlias}.commercialization_mode, '${DEFAULT_COMMERCIALIZATION_MODE}') = '${PROPERTY_COMMERCIALIZATION_MODES.WITH_AGENTS}'`;
}

export function propertyCommercializationJoin(
  propertyAlias = "p",
  commercializationAlias = "pc",
): string {
  return `LEFT JOIN property_commercialization ${commercializationAlias} ON ${commercializationAlias}.property_id = ${propertyAlias}.id`;
}

export function isAgentParticipationAllowed(
  mode: string | null | undefined,
): boolean {
  return (
    (mode ?? DEFAULT_COMMERCIALIZATION_MODE) ===
    PROPERTY_COMMERCIALIZATION_MODES.WITH_AGENTS
  );
}

export function commercializationModeFromType(
  commercializationType: "AGENTS" | "DIRECT",
): PropertyCommercializationMode {
  return commercializationType === "DIRECT"
    ? PROPERTY_COMMERCIALIZATION_MODES.WITHOUT_INTERMEDIARIES
    : PROPERTY_COMMERCIALIZATION_MODES.WITH_AGENTS;
}

/** Agent join requests always require owner approval when agents are accepted. */
export function manualApprovalFromType(
  commercializationType: "AGENTS" | "DIRECT",
): boolean {
  return commercializationType === "AGENTS";
}
