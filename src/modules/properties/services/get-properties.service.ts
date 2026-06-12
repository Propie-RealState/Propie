import { getPropertiesRepository } from "../repositories/property-read.repository";

export async function getPropertiesService() {
  return getPropertiesRepository();
}