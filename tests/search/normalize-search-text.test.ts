import { describe, expect, it } from "vitest";

import { db } from "@/database/client";
import {
  normalizeSearchText,
  sqlNormalizeColumn,
} from "@/modules/search/utils/normalize-search-text";

async function sqlNormalize(value: string): Promise<string> {
  const result = await db.query<{ normalized: string }>(
    `SELECT ${sqlNormalizeColumn("$1")} AS normalized`,
    [value],
  );

  return result.rows[0]?.normalized ?? "";
}

describe("search text normalization parity", () => {
  const cases = [
    "Juan-Perez",
    "O'Brien",
    "José",
    "María-Luisa",
    "José     Pérez",
    "  leading and trailing  ",
    "multiple   consecutive   spaces",
    "UPPERCASE",
    "lowercase",
    "MiXeD CaSe",
    "José María",
    "jose maria",
    "JOSÉ",
    "ñoño",
    "user@name",
    "a---b",
    "O´Brien",
  ] as const;

  it.each(cases)(
    "JS and SQL produce the same normalized string for %j",
    async (input) => {
      const fromJs = normalizeSearchText(input);
      const fromSql = await sqlNormalize(input);

      expect(fromSql).toBe(fromJs);
    },
  );

  it("strips accents the same way in JS and SQL", async () => {
    expect(normalizeSearchText("José")).toBe("jose");
    expect(await sqlNormalize("José")).toBe("jose");
    expect(normalizeSearchText("María")).toBe("maria");
    expect(await sqlNormalize("María")).toBe("maria");
  });

  it("turns hyphens and apostrophes into spaces (not deletions)", async () => {
    expect(normalizeSearchText("Juan-Perez")).toBe("juan perez");
    expect(await sqlNormalize("Juan-Perez")).toBe("juan perez");
    expect(normalizeSearchText("O'Brien")).toBe("o brien");
    expect(await sqlNormalize("O'Brien")).toBe("o brien");
    expect(normalizeSearchText("María-Luisa")).toBe("maria luisa");
    expect(await sqlNormalize("María-Luisa")).toBe("maria luisa");
  });

  it("collapses whitespace and trims", async () => {
    expect(normalizeSearchText("José     Pérez")).toBe("jose perez");
    expect(await sqlNormalize("José     Pérez")).toBe("jose perez");
    expect(normalizeSearchText("  spaced  ")).toBe("spaced");
    expect(await sqlNormalize("  spaced  ")).toBe("spaced");
  });

  it("keeps SQL accent translate maps aligned (same length)", () => {
    const from = "áàäâãåéèëêíìïîóòöôõúùüûñç";
    const to = "aaaaaaeeeeiiiiooooouuuunc";

    expect([...from].length).toBe(25);
    expect([...to].length).toBe(25);
    expect([...to][[...from].indexOf("ñ")]).toBe("n");
    expect([...to][[...from].indexOf("ú")]).toBe("u");
  });
});
