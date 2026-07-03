import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usePropertyPublish } from "../../publish/context/PropertyPublishContext";
import { findPropertyById } from "../../publish/services/find-property-by-id";
import { mapApiPropertyToPublishData } from "../mappers/map-property-to-publish-data";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reset, updateData } = usePropertyPublish();

  useEffect(() => {
    async function loadProperty() {
      if (!id) {
        return;
      }

      try {
        const property = await findPropertyById(id);

        reset();

        updateData({
          ...mapApiPropertyToPublishData(property),
          publishMode: "edit",
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
