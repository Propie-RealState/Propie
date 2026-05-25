import { findProfileByUserId } from "../repositories/profiles.repository";

export async function getMyProfile(userId: string) {
  return findProfileByUserId(userId);
}