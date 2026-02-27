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

export interface RouteComparisonItem {
  route: Route;
  percentDiff: number;
  compliant: boolean;
}

export interface RouteComparisonResponse {
  targetIntensity: number;
  baseline: Route;
  comparisons: RouteComparisonItem[];
}

export interface ShipCompliance {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface BankingRecord {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  sourceYear: number;
  createdAt: string;
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

export async function unsetBaseline(routeId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/routes/${routeId}/baseline`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to unset baseline: ${res.status} ${res.statusText}`);
  }
}

export async function fetchRouteComparison(): Promise<RouteComparisonResponse> {
  const res = await fetch(`${BASE_URL}/routes/comparison`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch comparison: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<RouteComparisonResponse>;
}

export async function fetchComplianceCb(
  shipId: string,
  year: number
): Promise<ShipCompliance> {
  const params = new URLSearchParams({
    shipId,
    year: String(year),
  });
  const res = await fetch(`${BASE_URL}/compliance/cb?${params.toString()}`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch compliance balance: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<ShipCompliance>;
}

export async function fetchAdjustedCb(
  year: number
): Promise<ShipCompliance[]> {
  const params = new URLSearchParams({ year: String(year) });
  const res = await fetch(
    `${BASE_URL}/compliance/adjusted-cb?${params.toString()}`
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch adjusted compliance: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<ShipCompliance[]>;
}

export async function fetchBankingRecords(
  shipId: string,
  year: number
): Promise<BankingRecord[]> {
  const params = new URLSearchParams({
    shipId,
    year: String(year),
  });
  const res = await fetch(
    `${BASE_URL}/banking/records?${params.toString()}`
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch banking records: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<BankingRecord[]>;
}

export async function bankSurplus(
  shipId: string,
  year: number
): Promise<{ shipId: string; year: number; banked: number }> {
  const res = await fetch(`${BASE_URL}/banking/bank`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shipId, year }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to bank surplus: ${res.status} ${res.statusText} - ${text}`
    );
  }
  return res.json() as Promise<{ shipId: string; year: number; banked: number }>;
}

export async function applyBank(
  shipId: string,
  year: number,
  amount: number
): Promise<{ shipId: string; year: number; cb_before: number; applied: number; cb_after: number }> {
  const res = await fetch(`${BASE_URL}/banking/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shipId, year, amount }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to apply banked surplus: ${res.status} ${res.statusText} - ${text}`
    );
  }
  return res.json() as Promise<{
    shipId: string;
    year: number;
    cb_before: number;
    applied: number;
    cb_after: number;
  }>;
}

export async function createPool(
  year: number,
  shipIds: string[]
): Promise<{
  year: number;
  poolSum: number;
  members: { shipId: string; year: number; cb_before: number; cb_after: number }[];
}> {
  const res = await fetch(`${BASE_URL}/pools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      year,
      members: shipIds.map((shipId) => ({ shipId })),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to create pool: ${res.status} ${res.statusText} - ${text}`
    );
  }
  return res.json() as Promise<{
    year: number;
    poolSum: number;
    members: {
      shipId: string;
      year: number;
      cb_before: number;
      cb_after: number;
    }[];
  }>;
}
