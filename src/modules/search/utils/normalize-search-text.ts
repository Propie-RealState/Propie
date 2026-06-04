const ACCENT_MAP: Record<string, string> = {
  á: "a",
  à: "a",
  ä: "a",
  â: "a",
  ã: "a",
  å: "a",
  é: "e",
  è: "e",
  ë: "e",
  ê: "e",
  í: "i",
  ì: "i",
  ï: "i",
  î: "i",
  ó: "o",
  ò: "o",
  ö: "o",
  ô: "o",
  õ: "o",
  ú: "u",
  ù: "u",
  ü: "u",
  û: "u",
  ñ: "n",
  ç: "c",
};

export function normalizeSearchText(
  value: string,
): string {
  return value
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => ACCENT_MAP[char] ?? char)
    .join("")
    .replace(/[^a-z0-9@ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeLikePattern(
  value: string,
): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/** SQL expression mirroring {@link normalizeSearchText} for indexed-friendly filters. */
export function sqlNormalizeColumn(
  column: string,
): string {
  return `regexp_replace(
    translate(
      lower(coalesce(${column}, '')),
      'áàäâãåéèëêíìïîóòöôõúùüûñç',
      'aaaaaaeeeeiiiioooooouuuunc'
    ),
    '[^a-z0-9@ ]',
    '',
    'g'
  )`;
}
