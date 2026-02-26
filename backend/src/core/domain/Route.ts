/**
 * Route domain types based on FuelEU Maritime Regulation (EU) 2023/1805.
 * Tracks voyage data including fuel consumption, GHG intensity, and emissions.
 */

/** Fuel types used for maritime transport (e.g., VLSFO, LNG, methanol, biofuels). */
export type FuelType = string;

/** Ship/vessel classification (e.g., bulk carrier, container ship, passenger). */
export type VesselType = string;

/**
 * Represents a route/leg for compliance reporting.
 * GHG intensity is measured in gCO2eq/MJ per the FuelEU Maritime spec.
 */
export interface Route {
  /** Unique identifier for the route/leg */
  routeId: string;
  /** Type of vessel (bulk carrier, container, passenger, etc.) */
  vesselType: VesselType;
  /** Fuel type consumed (VLSFO, LNG, methanol, etc.) */
  fuelType: FuelType;
  /** Reporting year */
  year: number;
  /** GHG intensity in gCO2eq/MJ (grams CO2 equivalent per megajoule) */
  ghgIntensity: number;
  /** Fuel consumption in tonnes */
  fuelConsumption: number;
  /** Distance in nautical miles */
  distance: number;
  /** Total emissions in gCO2eq */
  totalEmissions: number;
  /** Whether this route contributes to baseline GHG intensity calculation */
  isBaseline: boolean;
}
