import { publishProperty } from "../services/publish-property";
import type { PublishMode } from "../types/property-publish.types";

export type WizardFinalizationKind = "publish" | "save_edits";

/** UI copy + CTA order — safe to pass into presentational components. */
export type WizardFinalizationPresentation = {
  kind: WizardFinalizationKind;
  stepTitle: string;
  ctaLabel: string;
  successEyebrow: string;
  successHeadline: string;
  successBullets: readonly [string, string];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  /** Prefer viewing the listing after edit; explore after first publish. */
  primaryAction: "explore" | "view_publication";
};

export type WizardFinalizationStrategy = WizardFinalizationPresentation & {
  finalize: (propertyId: string) => Promise<void>;
};

const publishFinalization: WizardFinalizationStrategy = {
  kind: "publish",
  stepTitle: "Verificación y publicar",
  ctaLabel: "Publicar propiedad",
  successEyebrow: "Publicación completada",
  successHeadline: "¡Tu propiedad ya está online!",
  successBullets: [
    "Tu publicación ya puede aparecer en búsquedas y mapas.",
    "Los agentes Propie ya pueden aplicar para comercializarla.",
  ],
  primaryActionLabel: "Explorar propiedades",
  secondaryActionLabel: "Ver tu publicación",
  primaryAction: "explore",
  async finalize(propertyId: string) {
    await publishProperty(propertyId);
  },
};

const saveEditsFinalization: WizardFinalizationStrategy = {
  kind: "save_edits",
  stepTitle: "Verificación y guardar",
  ctaLabel: "Guardar cambios",
  successEyebrow: "Edición completada",
  successHeadline: "Los cambios se guardaron correctamente.",
  successBullets: [
    "Tus cambios ya están visibles en la publicación.",
    "Podés seguir editando cuando quieras desde el detalle.",
  ],
  primaryActionLabel: "Ver tu publicación",
  secondaryActionLabel: "Explorar propiedades",
  primaryAction: "view_publication",
  async finalize(_propertyId: string) {
    // Step PATCH endpoints already persisted edits before Step 5.
  },
};

/**
 * Resolve how the shared wizard should finish.
 * Create / draft resume → publish. Edit of a live listing → save confirmation.
 */
export function resolveWizardFinalization(
  publishMode: PublishMode | null,
): WizardFinalizationStrategy {
  if (publishMode === "edit") {
    return saveEditsFinalization;
  }

  return publishFinalization;
}
