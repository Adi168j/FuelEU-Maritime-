import { useEffect, useMemo, useState } from "react";
import type { Route, ShipCompliance, BankingRecord } from "../apiClient";
import {
  applyBank,
  bankSurplus,
  fetchBankingRecords,
  fetchComplianceCb,
  fetchRoutes,
} from "../apiClient";

export function BankingTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | "">("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [cb, setCb] = useState<ShipCompliance | null>(null);
  const [records, setRecords] = useState<BankingRecord[]>([]);
  const [applyAmount, setApplyAmount] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
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

  async function loadCbAndRecords(shipId: string, year: number) {
    try {
      const balance = await fetchComplianceCb(shipId, year);
      setCb(balance);
      const recs = await fetchBankingRecords(shipId, year);
      setRecords(recs);
      setStatus(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleCompute() {
    if (!selectedRouteId || !selectedYear) return;
    await loadCbAndRecords(selectedRouteId, Number(selectedYear));
  }

  async function handleBank() {
    if (!selectedRouteId || !selectedYear || !cb) return;
    try {
      const result = await bankSurplus(selectedRouteId, Number(selectedYear));
      setStatus(
        `Banked ${result.banked.toFixed(2)} gCO₂e from ${result.shipId}/${result.year}`
      );
      await loadCbAndRecords(selectedRouteId, Number(selectedYear));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleApply() {
    if (!selectedRouteId || !selectedYear) return;
    const amount = Number(applyAmount);
    if (!amount || Number.isNaN(amount)) {
      setError("Enter a valid amount to apply.");
      return;
    }
    try {
      const result = await applyBank(
        selectedRouteId,
        Number(selectedYear),
        amount
      );
      setStatus(
        `Applied ${result.applied.toFixed(
          2
        )}. CB: ${result.cb_before.toFixed(2)} → ${result.cb_after.toFixed(2)}`
      );
      await loadCbAndRecords(selectedRouteId, Number(selectedYear));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const cbValue = cb?.amountGco2eq ?? 0;
  const canBank = cbValue > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Route (shipId)
            </label>
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
            >
              <option value="">Select route</option>
              {routes.map((r) => (
                <option key={r.routeId} value={r.routeId}>
                  {r.routeId} ({r.year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Year
            </label>
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value ? Number(e.target.value) : ("" as "")
                )
              }
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCompute}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              disabled={!selectedRouteId || !selectedYear}
            >
              Compute CB
            </button>
          </div>
        </div>

        {cb && (
          <div className="mt-3 text-sm">
            <div>
              <span className="font-medium">Compliance balance:</span>{" "}
              {cb.amountGco2eq.toFixed(2)} gCO₂e
            </div>
            <div className="text-xs text-muted-foreground">
              Positive = surplus, negative = deficit.
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-3 text-sm">
        <div className="flex flex-wrap items-end gap-3">
          <button
            type="button"
            onClick={handleBank}
            disabled={!canBank}
            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Bank surplus
          </button>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Amount to apply (gCO₂e)
            </label>
            <input
              type="number"
              value={applyAmount}
              onChange={(e) => setApplyAmount(e.target.value)}
              className="w-40 rounded-md border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Apply banked
          </button>
        </div>

        {status && (
          <div className="text-xs text-green-700">{status}</div>
        )}
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-gray-900">
          Banking records
        </div>
        {records.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            No banking records for this ship/year.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  Year
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  Amount (gCO₂e)
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  Source year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-1.5">{r.year}</td>
                  <td className="px-3 py-1.5">{r.amountGco2eq.toFixed(2)}</td>
                  <td className="px-3 py-1.5">{r.sourceYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

