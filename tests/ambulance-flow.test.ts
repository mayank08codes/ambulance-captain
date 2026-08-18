import { describe, expect, it } from "vitest";

import { calculateFare, canTransition, chooseRoute, isValidOtp } from "../lib/ambulance-flow";

describe("ambulance captain workflow", () => {
  it("accepts the demo passenger OTP and rejects an incorrect code", () => {
    expect(isValidOtp("4826")).toBe(true);
    expect(isValidOtp("4827")).toBe(false);
  });

  it("allows only the next safe trip transition", () => {
    expect(canTransition("incoming", "accepted")).toBe(true);
    expect(canTransition("incoming", "completed")).toBe(false);
    expect(canTransition("arrived", "completed")).toBe(true);
  });

  it("calculates the fare from transparent components", () => {
    expect(calculateFare(520, 120, 40)).toBe(680);
  });

  it("chooses the fastest route and uses traffic as a tie breaker", () => {
    expect(chooseRoute([{ etaMinutes: 12, trafficLevel: 1 }, { etaMinutes: 9, trafficLevel: 3 }])).toEqual({ etaMinutes: 9, trafficLevel: 3 });
    expect(chooseRoute([{ etaMinutes: 9, trafficLevel: 3 }, { etaMinutes: 9, trafficLevel: 1 }])).toEqual({ etaMinutes: 9, trafficLevel: 1 });
    expect(chooseRoute([])).toBeNull();
  });
});
