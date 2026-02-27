import { CalculateCBUseCase } from "../CalculateCBUseCase";
import { Route } from "../../domain/Route";

describe("CalculateCBUseCase", () => {
  const useCase = new CalculateCBUseCase();
  const baseRoute: Route = {
    routeId: "r1",
    vesselType: "container",
    fuelType: "VLSFO",
    year: 2025,
    ghgIntensity: 0, // to be overridden
    fuelConsumption: 100, // tonnes
    distance: 1000,
    totalEmissions: 0,
    isBaseline: false,
  };

  it("returns positive surplus when ghgIntensity is below target", () => {
    const route = { ...baseRoute, ghgIntensity: 88.0 };
    const result = useCase.execute(route);
    expect(result.amountGco2eq).toBeGreaterThan(0);
  });

  it("returns negative deficit when ghgIntensity is above target", () => {
    const route = { ...baseRoute, ghgIntensity: 91.0 };
    const result = useCase.execute(route);
    expect(result.amountGco2eq).toBeLessThan(0);
  });
});