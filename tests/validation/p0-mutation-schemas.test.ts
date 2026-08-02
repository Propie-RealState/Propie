import { describe, expect, it } from "vitest";

import { RefreshTokenSchema } from "../../src/modules/auth/schemas/auth.schema";
import { UpdateProfileSchema } from "../../src/modules/profiles/schemas/update-profile.schema";
import { CreatePropertySchema } from "../../src/modules/properties/schemas/create-property.schema";
import { updatePropertyBasicSchema } from "../../src/modules/properties/schemas/update-property-basic.schema";

describe("P0 UpdateProfileSchema", () => {
  it("accepts digits-only phone within limits", () => {
    expect(
      UpdateProfileSchema.parse({ phone: "1123456789", location: "CABA" }),
    ).toMatchObject({ phone: "1123456789", location: "CABA" });
  });

  it("rejects phone with letters", () => {
    expect(() =>
      UpdateProfileSchema.parse({ phone: "+123456789dsa" }),
    ).toThrow();
  });

  it("allows clearing phone with empty string", () => {
    expect(UpdateProfileSchema.parse({ phone: "" })).toEqual({ phone: "" });
  });

  it("rejects oversized bio", () => {
    expect(() =>
      UpdateProfileSchema.parse({ bio: "x".repeat(301) }),
    ).toThrow();
  });
});

describe("P0 CreatePropertySchema", () => {
  it("accepts valid enums", () => {
    expect(
      CreatePropertySchema.parse({
        propertyType: "HOUSE",
        listingType: "SALE",
      }),
    ).toEqual({ propertyType: "HOUSE", listingType: "SALE" });
  });

  it("rejects wrong enums", () => {
    expect(() =>
      CreatePropertySchema.parse({
        propertyType: "CASTLE",
        listingType: "SALE",
      }),
    ).toThrow();
  });
});

describe("P0 updatePropertyBasicSchema", () => {
  const valid = {
    title: "Depto luminoso",
    description: "Nice place",
    price: 100000,
    currency: "USD" as const,
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 70,
    propertyType: "APARTMENT" as const,
    operationType: "RENT" as const,
  };

  it("accepts valid payload", () => {
    expect(updatePropertyBasicSchema.parse(valid)).toMatchObject(valid);
  });

  it("rejects empty title", () => {
    expect(() =>
      updatePropertyBasicSchema.parse({ ...valid, title: "" }),
    ).toThrow();
  });

  it("rejects negative price", () => {
    expect(() =>
      updatePropertyBasicSchema.parse({ ...valid, price: -1 }),
    ).toThrow();
  });
});

describe("P0 RefreshTokenSchema", () => {
  it("requires refreshToken string", () => {
    expect(RefreshTokenSchema.parse({ refreshToken: "abc" })).toEqual({
      refreshToken: "abc",
    });
    expect(() => RefreshTokenSchema.parse({})).toThrow();
    expect(() => RefreshTokenSchema.parse({ refreshToken: 1 })).toThrow();
  });
});
