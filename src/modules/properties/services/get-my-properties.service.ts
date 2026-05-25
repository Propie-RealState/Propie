import { getMyPropertiesRepository } from "../repositories/get-my-properties.repository";

export async function getMyPropertiesService(
  userId: string
) {
  return await getMyPropertiesRepository(userId);
}