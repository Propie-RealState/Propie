import type { FastifyReply, FastifyRequest } from "fastify";

import {
  getAdminOverviewService,
  getAdminUsersService,
  getAdminPropertiesService,
  getAdminAgentsService,
  getAdminBIService,
  type HealthPeriod,
} from "../services/admin-analytics.service";

function parseDateRange(query: Record<string, unknown>) {
  const now = new Date();
  const to = (query.to as string) || now.toISOString();
  const from =
    (query.from as string) ||
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return { from, to };
}

export async function adminOverviewController(
  request: FastifyRequest<{ Querystring: Record<string, unknown> }>,
  reply: FastifyReply,
) {
  const range = parseDateRange(request.query);
  const data = await getAdminOverviewService(range);

  return reply.send({ success: true, data });
}

export async function adminUsersController(
  request: FastifyRequest<{ Querystring: Record<string, unknown> }>,
  reply: FastifyReply,
) {
  const range = parseDateRange(request.query);
  const data = await getAdminUsersService(range);

  return reply.send({ success: true, data });
}

export async function adminPropertiesController(
  request: FastifyRequest<{ Querystring: Record<string, unknown> }>,
  reply: FastifyReply,
) {
  const range = parseDateRange(request.query);
  const data = await getAdminPropertiesService(range);

  return reply.send({ success: true, data });
}

export async function adminAgentsController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await getAdminAgentsService();

  return reply.send({ success: true, data });
}

function parseHealthPeriodQuery(query: Record<string, unknown>): HealthPeriod {
  const period = query.period as string;
  if (period === "7d" || period === "90d") return period;
  return "30d";
}

export async function adminBIController(
  request: FastifyRequest<{ Querystring: Record<string, unknown> }>,
  reply: FastifyReply,
) {
  const period = parseHealthPeriodQuery(request.query);
  const data = await getAdminBIService(period);

  return reply.send({ success: true, data });
}
