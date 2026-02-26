import { useEffect, useState } from "react";
import type { Route } from "../apiClient";
import { fetchRoutes, setBaseline } from "../apiClient";

export function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes().then(setRoutes).catch(console.error);
  }, []);

  async function handleSetBaseline(routeId: string) {
    await setBaseline(routeId);
    const updated = await fetchRoutes();
    setRoutes(updated);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Routes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                Route ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                Vessel Type
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                Fuel Type
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                Year
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                GHG Intensity
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                Baseline
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {routes.map((route) => (
              <tr key={route.routeId}>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {route.routeId}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {route.vesselType}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {route.fuelType}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {route.year}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {route.ghgIntensity}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {route.isBaseline ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => handleSetBaseline(route.routeId)}
                    disabled={route.isBaseline}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Set Baseline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
