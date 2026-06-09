import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usePropertyPublish } from "../../publish/context/PropertyPublishContext";

import { getPropertyById  } from "../services/property-details.service";
import React from "react";
import { ListingType, PropertyType } from "../../publish/types/property-publish.types";

export default function EditProperty() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { reset, updateData } =
    usePropertyPublish();

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;

      try {
        const property =
          await getPropertyById (id);

        reset();

        updateData({
          publishMode: "edit",
          propertyId: property.id,

          propertyType: property.propertyType as PropertyType,

          listingType: property.operationType as ListingType,

          title: property.title,

          description:
            property.description,

          country:
            property.location.country,

          province:
            property.location.province,

          city: property.location.city,

          neighborhood:
            property.location.neighborhood,

          address:
            property.location.address,

          bedrooms:
            property.bedrooms,

          bathrooms:
            property.bathrooms,

          areaM2: property.areaM2,

          price: property.price,

          currency: property.currency === "ARS" ? "ARS" : "USD",

          images: property.images.map((image: { url: string }) => image.url),
        });

        navigate("/publicar");
      } catch (error) {
        console.error(error);
      }
    }

    loadProperty();
    // updateData/navigate omitted intentionally to avoid re-fetch loops
  }, [id]);

  return <div>Cargando...</div>;
}