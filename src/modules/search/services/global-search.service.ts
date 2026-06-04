import {
  buildLocationHaystack,
  buildPropertyHaystack,
  buildUserHaystack,
  searchAgentsRepository,
  searchLocationsRepository,
  searchOwnersRepository,
  searchPropertiesRepository,
} from "../repositories/global-search.repository";

import { sortBySearchRank } from "../utils/search-ranking";

import { normalizeSearchText } from "../utils/normalize-search-text";

export type GlobalSearchPropertyResult = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImage: string | null;
  operationType: string;
  propertyType: string;
};

export type GlobalSearchLocationResult = {
  id: string;
  label: string;
  subtitle: string | null;
};

export type GlobalSearchAgentResult = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
  managedProperties: number;
};

export type GlobalSearchOwnerResult = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
};

export type GlobalSearchResponse = {
  query: string;
  properties: GlobalSearchPropertyResult[];
  locations: GlobalSearchLocationResult[];
  agents: GlobalSearchAgentResult[];
  owners: GlobalSearchOwnerResult[];
};

function formatLocationSubtitle(
  city: string | null,
  province: string | null,
  country: string | null,
): string | null {
  const parts = [city, province, country].filter(Boolean);

  return parts.length ? parts.join(", ") : null;
}

function formatUserName(
  firstName: string | null,
  lastName: string | null,
): string {
  return [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "Usuario";
}

function formatUsername(
  email: string,
): string {
  const localPart = email.split("@")[0] ?? email;

  return `@${localPart}`;
}

function slugifyLocationId(
  label: string,
  city: string | null,
  province: string | null,
): string {
  return [label, city, province]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/**
 * Global platform search. SQL filters candidates; ranking is applied in-memory
 * so we can swap the repository for PostgreSQL FTS or Algolia/Meilisearch later.
 */
export async function globalSearchService(
  query: string,
  limitPerGroup = 8,
): Promise<GlobalSearchResponse> {
  const normalizedQuery =
    normalizeSearchText(query);

  if (normalizedQuery.length < 2) {
    return {
      query,
      properties: [],
      locations: [],
      agents: [],
      owners: [],
    };
  }

  const candidateLimit = Math.min(
    limitPerGroup * 3,
    30,
  );

  const [
    propertyRows,
    locationRows,
    agentRows,
    ownerRows,
  ] = await Promise.all([
    searchPropertiesRepository(
      query,
      candidateLimit,
    ),
    searchLocationsRepository(
      query,
      candidateLimit,
    ),
    searchAgentsRepository(
      query,
      candidateLimit,
    ),
    searchOwnersRepository(
      query,
      candidateLimit,
    ),
  ]);

  const rankedProperties = sortBySearchRank(
    propertyRows,
    query,
    buildPropertyHaystack,
    (row) => row.bedrooms ?? 0,
  )
    .slice(0, limitPerGroup)
    .map((row) => ({
      id: row.id,
      title: row.title?.trim() || "Propiedad sin título",
      subtitle: formatLocationSubtitle(
        row.city,
        row.province,
        null,
      ),
      coverImage: row.cover_image,
      operationType: row.operation_type,
      propertyType: row.property_type,
    }));

  const rankedLocations = sortBySearchRank(
    locationRows,
    query,
    buildLocationHaystack,
  )
    .slice(0, limitPerGroup)
    .map((row) => ({
      id: slugifyLocationId(
        row.label,
        row.city,
        row.province,
      ),
      label: row.label,
      subtitle: formatLocationSubtitle(
        row.city,
        row.province,
        row.country,
      ),
    }));

  const rankedAgents = sortBySearchRank(
    agentRows,
    query,
    buildUserHaystack,
    (row) => row.managed_properties,
  )
    .slice(0, limitPerGroup)
    .map((row) => ({
      id: row.id,
      fullName: formatUserName(
        row.first_name,
        row.last_name,
      ),
      username: formatUsername(row.email),
      avatarUrl: row.avatar_url,
      rating: Number(row.average_rating) || 0,
      managedProperties: row.managed_properties,
    }));

  const rankedOwners = sortBySearchRank(
    ownerRows,
    query,
    buildUserHaystack,
    (row) => row.managed_properties,
  )
    .slice(0, limitPerGroup)
    .map((row) => ({
      id: row.id,
      fullName: formatUserName(
        row.first_name,
        row.last_name,
      ),
      username: formatUsername(row.email),
      avatarUrl: row.avatar_url,
    }));

  return {
    query,
    properties: rankedProperties,
    locations: rankedLocations,
    agents: rankedAgents,
    owners: rankedOwners,
  };
}
