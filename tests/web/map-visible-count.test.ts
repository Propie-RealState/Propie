import { describe, expect, it } from "vitest";

import { countVisibleMapProperties } from "../../web/src/app/modules/map/utils/map-visible-count";
import type { MapResult } from "../../web/src/app/modules/map/types/map.types";

describe("countVisibleMapProperties", () => {
  it("returns 0 for an empty result set", () => {
    expect(countVisibleMapProperties([])).toBe(0);
  });

  it("counts individual property pins", () => {
    const items: MapResult[] = [
      {
        type: "property",
        id: "a",
        lat: 0,
        lng: 0,
        price: 1,
        currency: "ARS",
        operationType: "SALE",
        propertyType: "HOUSE",
        coverImage: null,
        location: null,
      },
      {
        type: "property",
        id: "b",
        lat: 1,
        lng: 1,
        price: 2,
        currency: "ARS",
        operationType: "RENT",
        propertyType: "APARTMENT",
        coverImage: null,
        location: null,
      },
    ];

    expect(countVisibleMapProperties(items)).toBe(2);
  });

  it("counts cluster members so clustered-only maps are not empty", () => {
    const items: MapResult[] = [
      {
        type: "cluster",
        clusterId: "c1",
        lat: 0,
        lng: 0,
        count: 4,
      },
      {
        type: "cluster",
        clusterId: "c2",
        lat: 1,
        lng: 1,
        count: 6,
      },
    ];

    expect(countVisibleMapProperties(items)).toBe(10);
  });

  it("sums properties and cluster counts", () => {
    const items: MapResult[] = [
      {
        type: "cluster",
        clusterId: "c1",
        lat: 0,
        lng: 0,
        count: 3,
      },
      {
        type: "property",
        id: "a",
        lat: 0,
        lng: 0,
        price: 1,
        currency: "ARS",
        operationType: "SALE",
        propertyType: "HOUSE",
        coverImage: null,
        location: null,
      },
    ];

    expect(countVisibleMapProperties(items)).toBe(4);
  });
});
