import {
    findPropertyByIdRepository,
  } from "../repositories/property-read.repository";
  
  import {
    updatePropertyBasicRepository,
  } from "../repositories/property-write.repository";
  
  import {
    UpdatePropertyBasicInput,
  } from "../schemas/update-property-basic.schema";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";

  import {
    DEFAULT_PROPERTY_CURRENCY,
  } from "../types/property-currency.types";

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

    const previousCurrency =
      property.currency ?? DEFAULT_PROPERTY_CURRENCY;
  
    await updatePropertyBasicRepository({
      propertyId:
        input.propertyId,
  
      title:
        input.title,
  
      description:
        input.description,
  
      price:
        input.price,

      currency:
        input.currency,

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
      const priceChanged =
        previousPrice !== null &&
        previousPrice !== input.price;
      const currencyChanged =
        previousCurrency !== input.currency;

      if (priceChanged || currencyChanged) {
        await notifyPropertyPriceChanged({
          propertyId: input.propertyId,
          oldPrice: previousPrice ?? input.price,
          newPrice: input.price,
          oldCurrency: previousCurrency,
          newCurrency: input.currency,
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
  }
