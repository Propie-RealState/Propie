import {
  addFavoriteRepository,
  isFavoriteRepository,
  listFavoritePropertyIdsRepository,
  removeFavoriteRepository,
  syncFavoritesRepository,
} from "../repositories/favorites.repository";
import { assertPropertyNotDeleted } from "@/modules/properties/utils/assert-property-owner";

export async function listFavoritePropertyIds(userId: string) {
  return listFavoritePropertyIdsRepository(userId);
}

export async function addFavorite(input: {
  userId: string;
  propertyId: string;
}) {
  await assertPropertyNotDeleted(input.propertyId);
  return addFavoriteRepository(input);
}

export async function removeFavorite(input: {
  userId: string;
  propertyId: string;
}) {
  return removeFavoriteRepository(input);
}

export async function isFavorite(input: {
  userId: string;
  propertyId: string;
}) {
  return isFavoriteRepository(input);
}

export async function syncFavorites(input: {
  userId: string;
  propertyIds: string[];
}) {
  return syncFavoritesRepository(input);
}
