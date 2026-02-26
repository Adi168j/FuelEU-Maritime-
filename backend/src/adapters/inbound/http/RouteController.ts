import { Request, Response, Router } from "express";
import { IRouteRepository } from "../../../core/ports/IRouteRepository";

export class RouteController {
  private readonly router = Router();

  constructor(private readonly routeRepository: IRouteRepository) {
    this.router.get("/routes", (req, res) => this.getRoutes(req, res));
    this.router.post("/routes/:id/baseline", (req, res) =>
      this.setBaseline(req, res)
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
}
