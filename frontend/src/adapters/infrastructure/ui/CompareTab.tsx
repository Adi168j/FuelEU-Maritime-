import { useEffect, useState } from "react";
import type {
  RouteComparisonItem,
  RouteComparisonResponse,
} from "../apiClient";
import { fetchRouteComparison } from "../apiClient";

export function CompareTab() {
  const [data, setData] = useState<RouteComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRouteComparison()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Loading comparison...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-card p-6 text-sm text-destructive-foreground">
        Failed to load comparison: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        <div className="font-medium text-gray-900">
          Target intensity: {data.targetIntensity.toFixed(4)} gCO₂e/MJ
        </div>
        <div className="text-muted-foreground">
          Baseline route: {data.baseline.routeId} (
          {data.baseline.ghgIntensity.toFixed(2)} gCO₂e/MJ)
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-900">
                Route
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-900">
                GHG Intensity (gCO₂e/MJ)
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-900">
                % vs baseline
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-900">
                Compliant
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.comparisons.map((item: RouteComparisonItem) => (
              <tr key={item.route.routeId}>
                <td className="px-4 py-2 text-gray-900">
                  {item.route.routeId}
                </td>
                <td className="px-4 py-2 text-gray-900">
                  {item.route.ghgIntensity.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-gray-900">
                  {item.percentDiff.toFixed(2)}%
                </td>
                <td className="px-4 py-2">
                  {item.compliant ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      ✅ Yes
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      ❌ No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 text-sm font-medium text-gray-900">
          GHG intensity comparison
        </div>
        <div className="space-y-2">
          {data.comparisons.map((item: RouteComparisonItem) => {
            const maxIntensity = Math.max(
              data.baseline.ghgIntensity,
              ...data.comparisons.map((c) => c.route.ghgIntensity)
            );
            const baselineWidth =
              (data.baseline.ghgIntensity / maxIntensity) * 100;
            const routeWidth =
              (item.route.ghgIntensity / maxIntensity) * 100;

            return (
              <div key={item.route.routeId} className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  {item.route.routeId}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${baselineWidth}%` }}
                    />
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${
                        item.compliant ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${routeWidth}%` }}
                    />
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Baseline vs route
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

