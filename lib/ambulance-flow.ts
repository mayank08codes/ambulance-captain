export type TripStatus = "incoming" | "accepted" | "otp_verified" | "en_route" | "arrived" | "completed";

const allowedTransitions: Record<TripStatus, TripStatus[]> = {
  incoming: ["accepted"],
  accepted: ["otp_verified"],
  otp_verified: ["en_route"],
  en_route: ["arrived"],
  arrived: ["completed"],
  completed: [],
};

export function isValidOtp(input: string, expected = "4826") {
  return input.trim() === expected;
}

export function canTransition(from: TripStatus, to: TripStatus) {
  return allowedTransitions[from].includes(to);
}

export function calculateFare(baseFare: number, distanceCharge: number, careFee: number) {
  return baseFare + distanceCharge + careFee;
}

export function chooseRoute(routes: Array<{ etaMinutes: number; trafficLevel: number }>) {
  if (routes.length === 0) return null;
  return routes.reduce((best, route) => {
    if (route.etaMinutes < best.etaMinutes) return route;
    if (route.etaMinutes === best.etaMinutes && route.trafficLevel < best.trafficLevel) return route;
    return best;
  });
}
