import { FastifyInstance } from "fastify";
import { getPropertiesController } from "../controllers/get-properties.controller";

export async function getPropertiesRoute(app: FastifyInstance) {
  app.get("/", getPropertiesController);
}