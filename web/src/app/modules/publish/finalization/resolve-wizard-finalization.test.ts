import { describe, expect, it, vi } from "vitest";

vi.mock("../services/publish-property", () => ({
  publishProperty: vi.fn(async () => ({ success: true })),
}));

import { publishProperty } from "../services/publish-property";
import { resolveWizardFinalization } from "./resolve-wizard-finalization";

describe("resolveWizardFinalization", () => {
  it("uses publish strategy for create mode", async () => {
    const strategy = resolveWizardFinalization("create");

    expect(strategy.kind).toBe("publish");
    expect(strategy.stepTitle).toBe("Verificación y publicar");
    expect(strategy.ctaLabel).toBe("Publicar propiedad");
    expect(strategy.successHeadline).toContain("online");

    await strategy.finalize("property-1");
    expect(publishProperty).toHaveBeenCalledWith("property-1");
  });

  it("uses save_edits strategy for edit mode without publishing", async () => {
    vi.mocked(publishProperty).mockClear();
    const strategy = resolveWizardFinalization("edit");

    expect(strategy.kind).toBe("save_edits");
    expect(strategy.stepTitle).toBe("Verificación y guardar");
    expect(strategy.ctaLabel).toBe("Guardar cambios");
    expect(strategy.successHeadline).toContain("guardaron");

    await strategy.finalize("property-1");
    expect(publishProperty).not.toHaveBeenCalled();
  });

  it("defaults null mode to publish (create draft resume)", () => {
    expect(resolveWizardFinalization(null).kind).toBe("publish");
  });
});
