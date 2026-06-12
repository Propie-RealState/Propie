import { getPropertyByIdRepository } from "../repositories/property-read.repository";
import { savePropertyCommercializationRepository } from "../repositories/save-property-commercialization.repository";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";

type Input = {
  ownerId: string;
  propertyId: string;
  commercializationType: "AGENTS" | "DIRECT";
  manualApproval: boolean;
};

export async function savePropertyCommercializationService(input: Input) {
  const property = await getPropertyByIdRepository(input.propertyId);

  if (!property) {
    throw new Error("Property not found");
  }

  await assertCanManageProperty(input.ownerId, input.propertyId);

  const commercialization = await savePropertyCommercializationRepository({
    propertyId: input.propertyId,
    commercializationType: input.commercializationType,
    manualApproval: input.manualApproval,
  });

  return commercialization;
}
