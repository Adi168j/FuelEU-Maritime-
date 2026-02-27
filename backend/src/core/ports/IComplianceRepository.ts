import { ShipCompliance } from "../domain/ShipCompliance";

export interface BankingRecord {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  sourceYear: number;
  createdAt: Date;
}

export interface IComplianceRepository {
  getRouteByShipAndYear(shipId: string, year: number): Promise<import("../domain/Route").Route | null>;

  getCompliance(shipId: string, year: number): Promise<ShipCompliance | null>;
  upsertCompliance(balance: ShipCompliance): Promise<void>;

  getBankingRecords(shipId: string, year: number): Promise<BankingRecord[]>;
  getTotalBanked(shipId: string, year: number): Promise<number>;
  addBankEntry(shipId: string, year: number, amountGco2eq: number, sourceYear: number): Promise<void>;
  applyBanked(shipId: string, year: number, amountToApply: number): Promise<void>;

  getCompliancesForYear(year: number, shipIds?: string[]): Promise<ShipCompliance[]>;
}

