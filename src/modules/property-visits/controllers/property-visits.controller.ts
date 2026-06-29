import type { FastifyReply, FastifyRequest } from "fastify";

import {
  CancelVisitSchema,
  CreateVisitSchema,
  ListVisitsQuerySchema,
  RescheduleVisitSchema,
  VisitAnalyticsQuerySchema,
  VisitIdParamsSchema,
} from "../schemas/visit.schema";
import { cancelVisitService } from "../services/cancel-visit.service";
import { completeVisitService } from "../services/complete-visit.service";
import { confirmVisitService } from "../services/confirm-visit.service";
import { createVisitService } from "../services/create-visit.service";
import { getVisitService } from "../services/get-visit.service";
import { listVisitsService } from "../services/list-visits.service";
import { processVisitRemindersService } from "../services/process-visit-reminders.service";
import { rescheduleVisitService } from "../services/reschedule-visit.service";
import { visitAnalyticsService } from "../services/visit-analytics.service";
import { VisitStatusTransitionError } from "../utils/visit-status-transitions";

function handleVisitError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    throw error;
  }

  if (
    error instanceof VisitStatusTransitionError
    || error.name === "VisitStatusTransitionError"
  ) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "VISIT_NOT_ACTIVE",
        message: error.message,
      },
    });
  }

  switch (error.message) {
    case "FORBIDDEN":
      return reply.status(403).send({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Forbidden",
        },
      });
    case "VISIT_NOT_FOUND":
    case "CONVERSATION_NOT_FOUND":
    case "PROPERTY_NOT_AVAILABLE":
      return reply.status(404).send({
        success: false,
        error: {
          code: error.message,
          message: error.message,
        },
      });
    case "AGENT_NOT_ACTIVE":
      return reply.status(403).send({
        success: false,
        error: {
          code: "AGENT_NOT_ACTIVE",
          message: "Agent is not active on this property",
        },
      });
    case "VISIT_NOT_ACTIVE":
    case "INVALID_SCHEDULED_AT":
      return reply.status(400).send({
        success: false,
        error: {
          code: error.message,
          message: error.message,
        },
      });
    default:
      throw error;
  }
}

export async function listVisitsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = ListVisitsQuerySchema.parse(request.query);

    const visits = await listVisitsService({
      userId: request.user.id,
      segment: query.segment,
      from: query.from,
      to: query.to,
    });

    return reply.send({
      success: true,
      data: visits,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function visitAnalyticsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = VisitAnalyticsQuerySchema.parse(request.query);

    const analytics = await visitAnalyticsService({
      userId: request.user.id,
      from: query.from,
      to: query.to,
    });

    return reply.send({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function getVisitController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = VisitIdParamsSchema.parse(request.params);

    const visit = await getVisitService({
      userId: request.user.id,
      visitId: params.id,
    });

    return reply.send({
      success: true,
      data: visit,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function createVisitController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = CreateVisitSchema.parse(request.body);

    const visit = await createVisitService({
      userId: request.user.id,
      conversationId: body.conversationId,
      scheduledAt: body.scheduledAt,
      durationMinutes: body.durationMinutes,
      notes: body.notes,
    });

    return reply.status(201).send({
      success: true,
      data: visit,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function confirmVisitController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = VisitIdParamsSchema.parse(request.params);

    const visit = await confirmVisitService({
      userId: request.user.id,
      visitId: params.id,
    });

    return reply.send({
      success: true,
      data: visit,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function rescheduleVisitController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = VisitIdParamsSchema.parse(request.params);
    const body = RescheduleVisitSchema.parse(request.body);

    const visit = await rescheduleVisitService({
      userId: request.user.id,
      visitId: params.id,
      scheduledAt: body.scheduledAt,
      durationMinutes: body.durationMinutes,
      notes: body.notes,
    });

    return reply.send({
      success: true,
      data: visit,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function cancelVisitController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = VisitIdParamsSchema.parse(request.params);
    const body = CancelVisitSchema.parse(request.body ?? {});

    const visit = await cancelVisitService({
      userId: request.user.id,
      visitId: params.id,
      reason: body.reason,
    });

    return reply.send({
      success: true,
      data: visit,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function completeVisitController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = VisitIdParamsSchema.parse(request.params);

    const visit = await completeVisitService({
      userId: request.user.id,
      visitId: params.id,
    });

    return reply.send({
      success: true,
      data: visit,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}

export async function processVisitRemindersController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const result = await processVisitRemindersService();

    return reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleVisitError(error, reply);
  }
}
