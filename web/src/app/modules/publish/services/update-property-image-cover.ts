export async function updatePropertyImageCover(
    propertyId: string,
    imageId: string,
  ) {
    const accessToken =
      localStorage.getItem("accessToken");
  
    const response = await fetch(
      `http://localhost:3000/properties/${propertyId}/images/${imageId}/cover`,
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