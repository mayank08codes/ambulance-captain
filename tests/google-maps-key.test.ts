import { describe, expect, it } from "vitest";

describe("Google Maps configuration", () => {
  it("has a usable browser key response from the Maps JavaScript and Places endpoint", async () => {
    const key = process.env.VITE_GOOGLE_MAPS_API_KEY;
    expect(key, "VITE_GOOGLE_MAPS_API_KEY is not configured").toBeTruthy();

    const response = await fetch(`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key ?? "")}&libraries=places`);
    const body = await response.text();

    expect(response.ok).toBe(true);
    expect(body).not.toContain("MissingKeyMapError");
    expect(body).not.toContain("InvalidKeyMapError");
    expect(body).not.toContain("ApiNotActivatedMapError");
  }, 15000);
});
