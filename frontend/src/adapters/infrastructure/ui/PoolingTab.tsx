import { useEffect, useMemo, useState } from "react";
import type { Route, ShipCompliance } from "../apiClient";
import { createPool, fetchAdjustedCb, fetchRoutes } from "../apiClient";

export function PoolingTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [year, setYear] = useState<number | "">("");
  const [selectedShipIds, setSelectedShipIds] = useState<string[]>([]);
  const [compliances, setCompliances] = useState<ShipCompliance[]>([]);
  const [poolResult, setPoolResult] = useState<{
    year: number;
    poolSum: number;
    members: { shipId: string; year: number; cb_before: number; cb_after: number }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutes()
      .then((r) => {
        setRoutes(r);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  const years = useMemo(
    () => Array.from(new Set(routes.map((r) => r.year))).sort(),
    [routes]
  );

  async function loadAdjustedCb(selectedYear: number) {
    try {
      const items = await fetchAdjustedCb(selectedYear);
      setCompliances(items);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleYearChange(value: string) {
    const parsed = value ? Number(value) : ("" as "");
    setYear(parsed);
    setSelectedShipIds([]);
    setPoolResult(null);
    if (parsed) {
      await loadAdjustedCb(parsed);
    } else {
      setCompliances([]);
    }
  }

  function toggleShip(shipId: string) {
    setSelectedShipIds((prev) =>
      prev.includes(shipId)
        ? prev.filter((id) => id !== shipId)
        : [...prev, shipId]
    );
  }

  async function handleCreatePool() {
    if (!year || selectedShipIds.length === 0) return;
    try {
      const result = await createPool(Number(year), selectedShipIds);
      setPoolResult(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const poolValid =
    poolResult && poolResult.poolSum >= 0
      ? "text-green-700"
      : "text-red-700";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 text-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Year
            </label>
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-muted-foreground max-w-md">
            Select a year where compliance balances have been computed and
            optionally banked / applied. Then choose ships to include in the pool.
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-gray-900">
          Ship compliance balances
        </div>
        {compliances.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            No compliance balances found for this year yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  Include
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  Ship
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  CB (gCO₂e)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {compliances.map((c) => (
                <tr key={c.shipId}>
                  <td className="px-3 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedShipIds.includes(c.shipId)}
                      onChange={() => toggleShip(c.shipId)}
                    />
                  </td>
                  <td className="px-3 py-1.5">{c.shipId}</td>
                  <td className="px-3 py-1.5">
                    {c.amountGco2eq.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCreatePool}
          disabled={!year || selectedShipIds.length === 0}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Create pool
        </button>
        {error && (
          <div className="text-xs text-red-600">
            {error}
          </div>
        )}
      </div>

      {poolResult && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-3">
          <div className={poolValid}>
            Pool sum: {poolResult.poolSum.toFixed(2)} gCO₂e
          </div>
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  Ship
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  CB before
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  CB after
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {poolResult.members.map((m) => (
                <tr key={m.shipId}>
                  <td className="px-3 py-1.5">{m.shipId}</td>
                  <td className="px-3 py-1.5">
                    {m.cb_before.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5">
                    {m.cb_after.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

