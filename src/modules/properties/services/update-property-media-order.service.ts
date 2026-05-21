import {
    updatePropertyMediaOrderRepository,
  } from "../repositories/update-property-media-order.repository";
  
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
  
    await updatePropertyMediaOrderRepository({
      propertyId,
      media,
      userId,
    });
  }