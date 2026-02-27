import { Request, Response, Router } from "express";
import { IRouteRepository } from "../../../core/ports/IRouteRepository";

const TARGET_INTENSITY = 89.3368;

export class RouteController {
  private readonly router = Router();

  constructor(private readonly routeRepository: IRouteRepository) {
    // More specific path first to avoid /routes/:id capturing "comparison"
    this.router.get("/routes/comparison", (req, res) =>
      this.getComparison(req, res)
    );
    this.router.get("/routes", (req, res) => this.getRoutes(req, res));
    this.router.post("/routes/:id/baseline", (req, res) =>
      this.setBaseline(req, res)
    );
    this.router.delete("/routes/:id/baseline", (req, res) =>
      this.unsetBaseline(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }

  private async getRoutes(_req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.routeRepository.findAll();
      res.json(routes);
    } catch (err) {
      console.error("GET /routes failed", err);
      res.status(500).json({
        error: "Failed to fetch routes",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async getComparison(_req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.routeRepository.findAll();

      const baselines = routes.filter((r) => r.isBaseline);
      if (baselines.length === 0) {
        res.status(400).json({ error: "No baseline route configured" });
        return;
      }

      // Pick the most recent baseline
      const baseline = baselines.reduce((latest, current) =>
        current.year > latest.year ? current : latest
      );

      const comparisons = routes
        .filter((r) => r.routeId !== baseline.routeId)
        .map((r) => {
          const percentDiff =
            ((r.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
          const compliant = r.ghgIntensity <= TARGET_INTENSITY;

          return {
            route: r,
            percentDiff,
            compliant,
          };
        });

      res.json({
        targetIntensity: TARGET_INTENSITY,
        baseline,
        comparisons,
      });
    } catch (err) {
      console.error("GET /routes/comparison failed", err);
      res.status(500).json({
        error: "Failed to fetch comparison",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async setBaseline(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: "Route id is required" });
      return;
    }

    try {
      const route = await this.routeRepository.findById(id);
      if (!route) {
        res.status(404).json({ error: "Route not found" });
        return;
      }

      await this.routeRepository.setBaseline(id);
      res.status(204).send();
    } catch (err) {
      console.error("POST /routes/:id/baseline failed", err);
      res.status(500).json({
        error: "Failed to set baseline",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async unsetBaseline(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: "Route id is required" });
      return;
    }

    try {
      const route = await this.routeRepository.findById(id);
      if (!route) {
        res.status(404).json({ error: "Route not found" });
        return;
      }

      await this.routeRepository.unsetBaseline(id);
      res.status(204).send();
    } catch (err) {
      console.error("DELETE /routes/:id/baseline failed", err);
      res.status(500).json({
        error: "Failed to unset baseline",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
