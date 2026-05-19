import { getPropertiesRepository } from "../repositories/get-properties.repository";

export async function getPropertiesService() {
  return getPropertiesRepository();
}