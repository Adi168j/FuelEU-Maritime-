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

export async function fetchRoutes(): Promise<Route[]> {
  const res = await fetch("http://localhost:3000/routes");
  if (!res.ok) {
    throw new Error(`Failed to fetch routes: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<Route[]>;
}
