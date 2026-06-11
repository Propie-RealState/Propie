import { describe, it, expect } from "vitest";

describe("property-conversations module", () => {
  it("exports PROPERTY_CONVERSATION_STATUSES", async () => {
    const mod = await import(
      "@/modules/property-conversations/types/property-conversation.types"
    );
    expect(mod.PROPERTY_CONVERSATION_STATUSES).toContain("OPEN");
  });
});
