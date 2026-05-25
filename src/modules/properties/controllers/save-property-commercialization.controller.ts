import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    savePropertyCommercializationService,
  } from "../services/save-property-commercialization.service";
  
  import {
    UpdatePropertyCommercializationInput,
  } from "../schemas/update-property-commercialization.schema";
  
  export async function savePropertyCommercializationController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
  
      Body:
        UpdatePropertyCommercializationInput;
    }>,
  
    reply: FastifyReply
  ) {
  
    const user =
      request.user;
  
    const commercialization =
      await savePropertyCommercializationService(
        {
          ownerId:
            user.id,
  
          propertyId:
            request.params.id,
  
          commercializationType:
            request.body
              .commercializationType,
  
          manualApproval:
            request.body
              .manualApproval,
  
          allowChat:
            request.body
              .allowChat,
  
          sharedCalendar:
            request.body
              .sharedCalendar,
        }
      );
  
    return reply.send({
      success: true,
  
      commercialization,
    });
  }