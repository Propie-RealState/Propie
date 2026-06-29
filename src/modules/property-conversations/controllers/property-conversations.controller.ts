import type { FastifyReply, FastifyRequest } from "fastify";

import {
  ConversationIdParamsSchema,
  ListMessagesQuerySchema,
  SendMessageSchema,
  StartConversationSchema,
  StartInternalConversationSchema,
} from "../schemas/property-conversation.schema";
import { getConversationService } from "../services/get-conversation.service";
import { listConversationsService } from "../services/list-conversations.service";
import { listHistoricalConversationsService } from "../services/list-historical-conversations.service";
import { listMessagesService } from "../services/list-messages.service";
import { markReadService } from "../services/mark-read.service";
import { sendMessageService } from "../services/send-message.service";
import { startConversationService } from "../services/start-conversation.service";
import { startInternalConversationService } from "../services/start-internal-conversation.service";
import {
  archiveConversationService,
  closeConversationService,
  ConversationStatusTransitionError,
  reopenConversationService,
} from "../services/update-conversation-status.service";

function handleConversationError(
  error: unknown,
  reply: FastifyReply,
) {
  if (!(error instanceof Error)) {
    throw error;
  }

  if (
    error instanceof ConversationStatusTransitionError
    || error.name === "ConversationStatusTransitionError"
  ) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "CONVERSATION_STATUS_TRANSITION_INVALID",
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
    case "CONVERSATION_NOT_FOUND":
    case "PROPERTY_NOT_AVAILABLE":
      return reply.status(404).send({
        success: false,
        error: {
          code: error.message,
          message: error.message,
        },
      });
    case "CHAT_DISABLED":
      return reply.status(403).send({
        success: false,
        error: {
          code: "CHAT_DISABLED",
          message: "Chat is disabled for this property",
        },
      });
    case "CONVERSATION_CLOSED":
      return reply.status(403).send({
        success: false,
        error: {
          code: "CONVERSATION_CLOSED",
          message: "Conversation is not open for new messages",
        },
      });
    case "EMPTY_MESSAGE":
    case "AGENT_REQUIRED":
      return reply.status(400).send({
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
    default:
      throw error;
  }
}

export async function startConversationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = StartConversationSchema.parse(request.body);

    const conversation = await startConversationService({
      clientId: request.user.id,
      propertyId: body.propertyId,
    });

    return reply.status(201).send({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function startInternalConversationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = StartInternalConversationSchema.parse(request.body);

    const conversation = await startInternalConversationService({
      userId: request.user.id,
      propertyId: body.propertyId,
      agentId: body.agentId,
    });

    return reply.status(201).send({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function listConversationsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const conversations = await listConversationsService({
      userId: request.user.id,
      userRole: request.user.role,
    });

    return reply.send({
      success: true,
      data: conversations,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function listHistoricalConversationsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const conversations = await listHistoricalConversationsService({
      userId: request.user.id,
      userRole: request.user.role,
    });

    return reply.send({
      success: true,
      data: conversations,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function getConversationController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = ConversationIdParamsSchema.parse(request.params);

    const conversation = await getConversationService({
      userId: request.user.id,
      userRole: request.user.role,
      conversationId: params.id,
    });

    return reply.send({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function listMessagesController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = ConversationIdParamsSchema.parse(request.params);
    const query = ListMessagesQuerySchema.parse(request.query);

    const messages = await listMessagesService({
      userId: request.user.id,
      userRole: request.user.role,
      conversationId: params.id,
      limit: query.limit,
      offset: query.offset,
    });

    return reply.send({
      success: true,
      data: messages,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function sendMessageController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = ConversationIdParamsSchema.parse(request.params);
    const body = SendMessageSchema.parse(request.body);

    const message = await sendMessageService({
      userId: request.user.id,
      conversationId: params.id,
      body: body.body,
    });

    return reply.status(201).send({
      success: true,
      data: message,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function markReadController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = ConversationIdParamsSchema.parse(request.params);

    await markReadService({
      userId: request.user.id,
      conversationId: params.id,
    });

    return reply.send({
      success: true,
      data: {
        conversationId: params.id,
      },
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function archiveConversationController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = ConversationIdParamsSchema.parse(request.params);

    const conversation = await archiveConversationService({
      userId: request.user.id,
      conversationId: params.id,
    });

    return reply.send({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function closeConversationController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = ConversationIdParamsSchema.parse(request.params);

    const conversation = await closeConversationService({
      userId: request.user.id,
      conversationId: params.id,
    });

    return reply.send({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}

export async function reopenConversationController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const params = ConversationIdParamsSchema.parse(request.params);

    const conversation = await reopenConversationService({
      userId: request.user.id,
      conversationId: params.id,
    });

    return reply.send({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return handleConversationError(error, reply);
  }
}
