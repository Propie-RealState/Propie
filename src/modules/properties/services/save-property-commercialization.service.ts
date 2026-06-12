import {
    getPropertyByIdRepository,
  } from "../repositories/property-read.repository";
  
  import {
    savePropertyCommercializationRepository,
  } from "../repositories/save-property-commercialization.repository";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";
  
  type Input = {
    ownerId: string;
  
    propertyId: string;
  
    commercializationType:
      | "AGENTS"
      | "AGENCIES"
      | "BOTH"
      | "DIRECT";
  
    manualApproval: boolean;
  
    allowChat: boolean;
  
    sharedCalendar: boolean;
  };
  
  export async function savePropertyCommercializationService(
    input: Input
  ) {
  
    const property =
      await getPropertyByIdRepository(
        input.propertyId
      );
  
    if (!property) {
      throw new Error(
        "Property not found"
      );
    }
  
    await assertCanManageProperty(
      input.ownerId,
      input.propertyId,
    );
  
    const commercialization =
      await savePropertyCommercializationRepository(
        {
          propertyId:
            input.propertyId,
  
          commercializationType:
            input.commercializationType,
  
          manualApproval:
            input.manualApproval,
  
          allowChat:
            input.allowChat,
  
          sharedCalendar:
            input.sharedCalendar,
        }
      );
  
    return commercialization;
  }