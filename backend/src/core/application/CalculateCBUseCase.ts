import { Route } from "../domain/Route";
import { ComplianceBalance } from "../domain/ComplianceBalance";

export class CalculateCBUseCase {
  /**
   * Calculate compliance balance using regulation formula.
   * (89.3368 - ghgIntensity) * (fuelConsumption * 41000)
   */
  execute(route: Route): ComplianceBalance {
    const amountGco2eq = (89.3368 - route.ghgIntensity) * (route.fuelConsumption * 41000);

    return {
      shipId: route.routeId, // using routeId as shipId for now; adjust if needed
      year: route.year,
      amountGco2eq,
    };
  }
}//