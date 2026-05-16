import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    findPropertyByIdService,
  } from "../services/find-property-by-id.service";
  
  export async function findPropertyByIdController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const property =
      await findPropertyByIdService(
        request.params.id
      );
  
    if (!property) {
      return reply
        .status(404)
        .send({
          message:
            "Property not found",
        });
    }
  
    if (
      property.owner_id !==
      request.user.id
    ) {
      return reply
        .status(403)
        .send({
          message:
            "Forbidden",
        });
    }
  
    return reply.send(property);
  }