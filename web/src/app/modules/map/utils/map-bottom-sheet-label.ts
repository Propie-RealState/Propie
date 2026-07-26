type MapBottomSheetLabelInput = {
  loading: boolean;
  /** Properties in the current viewport (list and/or map clusters). */
  visibleCount: number;
  /** Property cards currently rendered in the sheet. */
  listedCount: number;
};

/**
 * Label for the map bottom sheet.
 * Prefer the listed count when cards are available; never show empty
 * while the map still represents properties.
 */
export function getMapBottomSheetLabel(
  input: MapBottomSheetLabelInput,
): string {
  if (input.loading) {
    return "Actualizando mapa...";
  }

  if (input.visibleCount === 0) {
    return "No hay propiedades visibles";
  }

  const count =
    input.listedCount > 0 ? input.listedCount : input.visibleCount;

  return `${count} propiedades visibles`;
}
