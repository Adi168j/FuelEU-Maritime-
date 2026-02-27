import { Pool } from "pg";
import { IRouteRepository } from "../core/ports/IRouteRepository";
import { Route } from "../core/domain/Route";

function rowToRoute(row: Record<string, unknown>): Route {
  return {
    routeId: row.route_id as string,
    vesselType: row.vessel_type as string,
    fuelType: row.fuel_type as string,
    year: Number(row.year),
    ghgIntensity: Number(row.ghg_intensity),
    fuelConsumption: Number(row.fuel_consumption),
    distance: Number(row.distance),
    totalEmissions: Number(row.total_emissions),
    isBaseline: Boolean(row.is_baseline),
  };
}

export class PostgresRouteRepository implements IRouteRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<Route[]> {
    console.log("findAll() - Executing query...");
    try {
      const result = await this.pool.query(
        "SELECT route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline FROM routes ORDER BY year, route_id"
      );
      console.log("findAll() - Query succeeded, rows:", result.rows.length);
      return result.rows.map(rowToRoute);
    } catch (error) {
      console.error("findAll() - Query failed:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<Route | null> {
    const result = await this.pool.query(
      "SELECT route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline FROM routes WHERE route_id = $1",
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToRoute(result.rows[0]);
  }

  async setBaseline(routeId: string): Promise<void> {
    await this.pool.query("UPDATE routes SET is_baseline = false");
    await this.pool.query("UPDATE routes SET is_baseline = true WHERE route_id = $1", [
      routeId,
    ]);
  }

  async unsetBaseline(routeId: string): Promise<void> {
    await this.pool.query("UPDATE routes SET is_baseline = false WHERE route_id = $1", [
      routeId,
    ]);
  }
}
