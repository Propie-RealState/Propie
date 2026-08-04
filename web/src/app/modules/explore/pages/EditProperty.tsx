import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usePropertyPublish } from "../../publish/context/PropertyPublishContext";
import { fetchEditPublishWizardData } from "../mappers/fetch-edit-publish-wizard-data";

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
        const editData = await fetchEditPublishWizardData(id);

        reset();
        updateData(editData);
        navigate("/publicar");
      } catch (error) {
        console.error(error);
      }
    }

    void loadProperty();
    // updateData/navigate omitted intentionally to avoid re-fetch loops
  }, [id]);

  return <div>Cargando...</div>;
}
