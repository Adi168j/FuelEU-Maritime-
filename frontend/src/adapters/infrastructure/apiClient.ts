/** Expected Route shape from GET /routes API */
export interface Route {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

const BASE_URL = "http://localhost:3000";

export async function fetchRoutes(): Promise<Route[]> {
  const res = await fetch(`${BASE_URL}/routes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch routes: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<Route[]>;
}

export async function setBaseline(routeId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/routes/${routeId}/baseline`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to set baseline: ${res.status} ${res.statusText}`);
  }
}
