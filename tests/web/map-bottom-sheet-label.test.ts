import { describe, expect, it } from "vitest";

import { getMapBottomSheetLabel } from "../../web/src/app/modules/map/utils/map-bottom-sheet-label";

describe("getMapBottomSheetLabel", () => {
  it("shows loading copy while fetching", () => {
    expect(
      getMapBottomSheetLabel({
        loading: true,
        visibleCount: 0,
        listedCount: 0,
      }),
    ).toBe("Actualizando mapa...");
  });

  it("shows empty state only when nothing is in the viewport", () => {
    expect(
      getMapBottomSheetLabel({
        loading: false,
        visibleCount: 0,
        listedCount: 0,
      }),
    ).toBe("No hay propiedades visibles");
  });

  it("uses map presence when the list has not arrived yet", () => {
    expect(
      getMapBottomSheetLabel({
        loading: false,
        visibleCount: 10,
        listedCount: 0,
      }),
    ).toBe("10 propiedades visibles");
  });

  it("uses the listed card count when the unclustered list is ready", () => {
    expect(
      getMapBottomSheetLabel({
        loading: false,
        visibleCount: 10,
        listedCount: 10,
      }),
    ).toBe("10 propiedades visibles");
  });
});
