  import {
    updatePropertyMediaOrderRepository,
  } from "../repositories/update-property-media-order.repository";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";
  
  interface UpdatePropertyMediaOrderServiceRequest {
    propertyId: string;
  
    media: {
      id: string;
  
      type: "image" | "video";
    }[];
  
    userId: string;
  }
  
  export async function updatePropertyMediaOrderService({
    propertyId,
    media,
    userId,
  }: UpdatePropertyMediaOrderServiceRequest) {
  
    await assertCanManageProperty(userId, propertyId);

    await updatePropertyMediaOrderRepository({
      propertyId,
      media,
    });
  }