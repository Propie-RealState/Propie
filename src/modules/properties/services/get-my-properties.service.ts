import { getMyPropertiesRepository } from "../repositories/property-read.repository";

export async function getMyPropertiesService(
  userId: string
) {
  return await getMyPropertiesRepository(userId);
}