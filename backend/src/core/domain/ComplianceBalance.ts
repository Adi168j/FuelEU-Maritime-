/**
 * ComplianceBalance domain types based on FuelEU Maritime Regulation (EU) 2023/1805.
 * The compliance balance = (GHGIEtarget - GHGIEactual) × fuel energy amounts.
 * Positive balance = compliance surplus; negative = deficit (subject to penalties).
 */

/**
 * Represents a ship's annual compliance balance in gCO2 equivalent.
 * Positive values indicate compliance surplus; negative values indicate deficit.
 */
export interface ComplianceBalance {
  /** Ship identifier (IMO number or internal ID) */
  shipId: string;
  /** Reporting year */
  year: number;
  /** Net compliance balance in grams CO2 equivalent (gCO2eq).
   * Positive = surplus, negative = deficit. */
  amountGco2eq: number;
}
