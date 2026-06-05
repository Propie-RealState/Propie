import {
    findPropertyByIdRepository,
  } from "../repositories/find-property-by-id.repository";
  
  import {
    updatePropertyBasicRepository,
  } from "../repositories/update-property-basic.repository";
  
  import {
    UpdatePropertyBasicInput,
  } from "../schemas/update-property-basic.schema";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";

  import {
    notifyPropertyPriceChanged,
    notifyPropertyUpdated,
  } from "@/modules/notifications/services/notification-dispatch.service";
  
  export async function updatePropertyBasicService(
    input: UpdatePropertyBasicInput & {
      propertyId: string;
      ownerId: string;
    }
  ) {
    const property =
      await findPropertyByIdRepository(
        input.propertyId
      );
  
    if (!property) {
      throw new Error(
        "PROPERTY_NOT_FOUND"
      );
    }
  
    await assertCanManageProperty(
      input.ownerId,
      input.propertyId,
    );

    const previousPrice =
      property.price !== null && property.price !== undefined
        ? Number(property.price)
        : null;
  
    const updatedProperty = await updatePropertyBasicRepository({
      propertyId:
        input.propertyId,
  
      title:
        input.title,
  
      description:
        input.description,
  
      price:
        input.price,

      bedrooms:
        input.bedrooms,

      bathrooms:
        input.bathrooms,

      areaM2:
        input.areaM2,

      propertyType:
        input.propertyType,

      operationType:
        input.operationType,
    });

    try {
      if (
        previousPrice !== null &&
        previousPrice !== input.price
      ) {
        await notifyPropertyPriceChanged({
          propertyId: input.propertyId,
          oldPrice: previousPrice,
          newPrice: input.price,
          excludeUserId: input.ownerId,
        });
      } else {
        await notifyPropertyUpdated({
          propertyId: input.propertyId,
          excludeUserId: input.ownerId,
        });
      }
    } catch (error) {
      console.error("Failed to dispatch property update notifications", error);
    }

    return updatedProperty;
  }