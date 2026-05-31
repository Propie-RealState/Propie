import { API_URL } from "../../../../lib/api-base";

export async function updatePropertyImageCover(
    propertyId: string,
    imageId: string,
  ) {
    const accessToken =
      localStorage.getItem("accessToken");
  
    const response = await fetch(
      `${API_URL}/properties/${propertyId}/images/${imageId}/cover`,
      {
        method: "PATCH",
  
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  
    if (!response.ok) {
      throw new Error(
        "Update cover failed",
      );
    }
  }
