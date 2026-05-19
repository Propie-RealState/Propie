import {
    getPropertyByIdRepository,
  } from "../repositories/get-property-by-id.repository";
  
  import {
    savePropertyCommercializationRepository,
  } from "../repositories/save-property-commercialization.repository";
  
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
  
    if (
      property.owner_id !==
      input.ownerId
    ) {
      throw new Error(
        "Unauthorized"
      );
    }
  
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