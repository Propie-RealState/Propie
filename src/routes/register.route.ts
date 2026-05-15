import {
    FastifyInstance,
  } from 'fastify';
  
  import {
    RegisterSchema,
  } from '../modules/auth/schemas/register.schema';
  
  
  
  // ========================================================
  // REGISTER ROUTE
  // ========================================================
  
  export async function registerRoute(
    app: FastifyInstance
  ) {
    app.post(
      '/auth/register',
  
      async (
        request,
        reply
      ) => {
  
        // =====================================
        // VALIDATE
        // =====================================
  
        const parsed =
          RegisterSchema.safeParse(
            request.body
          );
  
        if (!parsed.success) {
          return reply
            .status(400)
            .send({
              error:
                'VALIDATION_ERROR',
  
              details:
                parsed.error.flatten(),
            });
        }
  
        // =====================================
        // VALID DATA
        // =====================================
  
        const data =
          parsed.data;
  
        console.log(data);
  
        // =====================================
        // TEMP RESPONSE
        // =====================================
  
        return reply
          .status(201)
          .send({
            success: true,
            message:
              'Register payload valid',
          });
      }
    );
  }