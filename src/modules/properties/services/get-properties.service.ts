import {
  getPropertiesKeysetRepository,
  getPropertiesRepository,
} from "../repositories/property-read.repository";
import {
  buildKeysetPage,
  type Cursor,
  type KeysetPage,
} from "@/database/shared/cursor";

type Options = {
  forAgentDiscovery?: boolean;
  limit?: number;
  offset?: number;
};

export async function getPropertiesService(options: Options = {}) {
  return getPropertiesRepository(options);
}

type KeysetOptions = {
  forAgentDiscovery?: boolean;
  limit: number;
  cursor?: Cursor | null;
};

export async function getPropertiesKeysetService(
  options: KeysetOptions,
): Promise<KeysetPage<Record<string, unknown>>> {
  const rows = await getPropertiesKeysetRepository({
    forAgentDiscovery: options.forAgentDiscovery,
    limit: options.limit,
    cursor: options.cursor ?? null,
  });

  return buildKeysetPage(rows, options.limit, (row) => ({
    createdAt: new Date(row.created_at).toISOString(),
    id: String(row.id),
  }));
}
