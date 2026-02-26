import { Route } from "../domain/Route";

export interface IRouteRepository {
  /**
   * Retrieve all routes.
   */
  findAll(): Promise<Route[]>;

  /**
   * Find a single route by its identifier.
   * @param id the routeId
   */
  findById(id: string): Promise<Route | null>;

  /**
   * Mark the given route as contributing to the baseline calculation.
   * @param routeId the id of the route to set as baseline
   */
  setBaseline(routeId: string): Promise<void>;
}