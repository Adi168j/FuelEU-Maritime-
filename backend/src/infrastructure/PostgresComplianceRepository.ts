import { Pool } from "pg";
import { IComplianceRepository, BankingRecord } from "../core/ports/IComplianceRepository";
import { ShipCompliance } from "../core/domain/ShipCompliance";
import { Route } from "../core/domain/Route";

export class PostgresComplianceRepository implements IComplianceRepository {
  constructor(private readonly pool: Pool) {}

  async getRouteByShipAndYear(shipId: string, year: number): Promise<Route | null> {
    const result = await this.pool.query(
      "SELECT route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline FROM routes WHERE route_id = $1 AND year = $2",
      [shipId, year]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      routeId: row.route_id,
      vesselType: row.vessel_type,
      fuelType: row.fuel_type,
      year: Number(row.year),
      ghgIntensity: Number(row.ghg_intensity),
      fuelConsumption: Number(row.fuel_consumption),
      distance: Number(row.distance),
      totalEmissions: Number(row.total_emissions),
      isBaseline: Boolean(row.is_baseline),
    };
  }

  async getCompliance(shipId: string, year: number): Promise<ShipCompliance | null> {
    const result = await this.pool.query(
      "SELECT ship_id, year, amount_gco2eq FROM ship_compliance WHERE ship_id = $1 AND year = $2",
      [shipId, year]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      shipId: row.ship_id,
      year: Number(row.year),
      amountGco2eq: Number(row.amount_gco2eq),
    };
  }

  async upsertCompliance(balance: ShipCompliance): Promise<void> {
    await this.pool.query(
      `INSERT INTO ship_compliance (ship_id, year, amount_gco2eq)
       VALUES ($1, $2, $3)
       ON CONFLICT (ship_id, year)
       DO UPDATE SET amount_gco2eq = EXCLUDED.amount_gco2eq`,
      [balance.shipId, balance.year, balance.amountGco2eq]
    );
  }

  async getBankingRecords(shipId: string, year: number): Promise<BankingRecord[]> {
    const result = await this.pool.query(
      `SELECT id, ship_id, year, amount_gco2eq, source_year, created_at
       FROM bank_entries
       WHERE ship_id = $1 AND year = $2
       ORDER BY created_at ASC`,
      [shipId, year]
    );
    return result.rows.map((row) => ({
      id: row.id,
      shipId: row.ship_id,
      year: Number(row.year),
      amountGco2eq: Number(row.amount_gco2eq),
      sourceYear: Number(row.source_year),
      createdAt: new Date(row.created_at),
    }));
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await this.pool.query(
      "SELECT COALESCE(SUM(amount_gco2eq), 0) AS total FROM bank_entries WHERE ship_id = $1 AND year = $2",
      [shipId, year]
    );
    return Number(result.rows[0]?.total ?? 0);
  }

  async addBankEntry(
    shipId: string,
    year: number,
    amountGco2eq: number,
    sourceYear: number
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO bank_entries (ship_id, year, amount_gco2eq, source_year)
       VALUES ($1, $2, $3, $4)`,
      [shipId, year, amountGco2eq, sourceYear]
    );
  }

  async applyBanked(shipId: string, year: number, amountToApply: number): Promise<void> {
    // Simple strategy: record a negative entry for the application year
    await this.pool.query(
      `INSERT INTO bank_entries (ship_id, year, amount_gco2eq, source_year)
       VALUES ($1, $2, $3, $2)`,
      [shipId, year, -Math.abs(amountToApply)]
    );
  }

  async getCompliancesForYear(year: number, shipIds?: string[]): Promise<ShipCompliance[]> {
    const params: any[] = [year];
    let sql =
      "SELECT ship_id, year, amount_gco2eq FROM ship_compliance WHERE year = $1";
    if (shipIds && shipIds.length > 0) {
      sql += " AND ship_id = ANY($2)";
      params.push(shipIds);
    }

    const result = await this.pool.query(sql, params);
    return result.rows.map((row) => ({
      shipId: row.ship_id,
      year: Number(row.year),
      amountGco2eq: Number(row.amount_gco2eq),
    }));
  }
}

