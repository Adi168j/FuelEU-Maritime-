import { Request, Response, Router } from "express";
import { IComplianceRepository } from "../../../core/ports/IComplianceRepository";
import { CalculateCBUseCase } from "../../../core/application/CalculateCBUseCase";
import { ShipCompliance } from "../../../core/domain/ShipCompliance";
import CreatePoolUseCase from "../../../core/application/CreatePoolUseCase";

export class ComplianceController {
  private readonly router = Router();

  constructor(
    private readonly complianceRepository: IComplianceRepository,
    private readonly calculateCBUseCase: CalculateCBUseCase
  ) {
    this.router.get("/compliance/cb", (req, res) => this.getComplianceCb(req, res));
    this.router.get("/compliance/adjusted-cb", (req, res) =>
      this.getAdjustedCb(req, res)
    );

    this.router.get("/banking/records", (req, res) =>
      this.getBankingRecords(req, res)
    );
    this.router.post("/banking/bank", (req, res) => this.bankSurplus(req, res));
    this.router.post("/banking/apply", (req, res) => this.applyBank(req, res));

    this.router.post("/pools", (req, res) => this.createPool(req, res));
  }

  getRouter(): Router {
    return this.router;
  }

  private async getComplianceCb(req: Request, res: Response): Promise<void> {
    const shipId = req.query.shipId as string | undefined;
    const yearStr = req.query.year as string | undefined;

    if (!shipId || !yearStr) {
      res.status(400).json({ error: "shipId and year are required" });
      return;
    }

    const year = Number(yearStr);

    try {
      const route = await this.complianceRepository.getRouteByShipAndYear(
        shipId,
        year
      );
      if (!route) {
        res.status(404).json({ error: "Route not found for ship/year" });
        return;
      }

      const cb = this.calculateCBUseCase.execute(route);
      await this.complianceRepository.upsertCompliance(cb);

      res.json(cb);
    } catch (err) {
      res.status(500).json({
        error: "Failed to compute compliance balance",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async getAdjustedCb(req: Request, res: Response): Promise<void> {
    const yearStr = req.query.year as string | undefined;

    if (!yearStr) {
      res.status(400).json({ error: "year is required" });
      return;
    }

    const year = Number(yearStr);

    try {
      const compliances = await this.complianceRepository.getCompliancesForYear(year);
      res.json(compliances);
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch adjusted compliance",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async getBankingRecords(req: Request, res: Response): Promise<void> {
    const shipId = req.query.shipId as string | undefined;
    const yearStr = req.query.year as string | undefined;

    if (!shipId || !yearStr) {
      res.status(400).json({ error: "shipId and year are required" });
      return;
    }

    const year = Number(yearStr);

    try {
      const records = await this.complianceRepository.getBankingRecords(shipId, year);
      res.json(records);
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch banking records",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async bankSurplus(req: Request, res: Response): Promise<void> {
    const { shipId, year } = req.body as { shipId?: string; year?: number };

    if (!shipId || !year) {
      res.status(400).json({ error: "shipId and year are required" });
      return;
    }

    try {
      const existing = await this.complianceRepository.getCompliance(shipId, year);
      if (!existing) {
        res.status(404).json({ error: "Compliance balance not found" });
        return;
      }

      if (existing.amountGco2eq <= 0) {
        res
          .status(400)
          .json({ error: "Cannot bank non-positive compliance balance" });
        return;
      }

      await this.complianceRepository.addBankEntry(
        shipId,
        year,
        existing.amountGco2eq,
        year
      );

      res.json({
        shipId,
        year,
        banked: existing.amountGco2eq,
      });
    } catch (err) {
      res.status(500).json({
        error: "Failed to bank compliance surplus",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async applyBank(req: Request, res: Response): Promise<void> {
    const { shipId, year, amount } = req.body as {
      shipId?: string;
      year?: number;
      amount?: number;
    };

    if (!shipId || !year || typeof amount !== "number") {
      res.status(400).json({ error: "shipId, year and amount are required" });
      return;
    }

    try {
      const existing = await this.complianceRepository.getCompliance(shipId, year);
      if (!existing) {
        res.status(404).json({ error: "Compliance balance not found" });
        return;
      }

      const totalBanked = await this.complianceRepository.getTotalBanked(
        shipId,
        year
      );

      if (totalBanked <= 0) {
        res.status(400).json({ error: "No banked surplus available" });
        return;
      }

      const deficit = existing.amountGco2eq < 0 ? Math.abs(existing.amountGco2eq) : 0;
      const maxApplicable = Math.min(totalBanked, deficit || amount);
      const applied = Math.min(amount, maxApplicable);

      if (applied <= 0) {
        res.status(400).json({ error: "Nothing to apply" });
        return;
      }

      const cbBefore = existing.amountGco2eq;
      const cbAfter = cbBefore + applied;

      const updated: ShipCompliance = {
        shipId,
        year,
        amountGco2eq: cbAfter,
      };

      await this.complianceRepository.applyBanked(shipId, year, applied);
      await this.complianceRepository.upsertCompliance(updated);

      res.json({
        shipId,
        year,
        cb_before: cbBefore,
        applied,
        cb_after: cbAfter,
      });
    } catch (err) {
      res.status(500).json({
        error: "Failed to apply banked surplus",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async createPool(req: Request, res: Response): Promise<void> {
    const { year, members } = req.body as {
      year?: number;
      members?: { shipId: string }[];
    };

    if (!year || !members || members.length === 0) {
      res
        .status(400)
        .json({ error: "year and members (shipId[]) are required for pooling" });
      return;
    }

    try {
      const shipIds = members.map((m: { shipId: string }) => m.shipId);
      const compliances = await this.complianceRepository.getCompliancesForYear(
        year,
        shipIds
      );

      const balances = compliances.map((c: ShipCompliance) => ({
        id: c.shipId,
        amountGco2eq: c.amountGco2eq,
      }));

      const poolUseCase = new CreatePoolUseCase(balances);
      const redistributed = poolUseCase.execute();

      const result = redistributed.map((r) => ({
        shipId: r.id,
        year,
        cb_before:
          compliances.find((c) => c.shipId === r.id)?.amountGco2eq ?? 0,
        cb_after: r.amountGco2eq,
      }));

      res.json({
        year,
        poolSum: result.reduce(
          (sum: number, r: { cb_after: number }) => sum + r.cb_after,
          0
        ),
        members: result,
      });
    } catch (err) {
      res.status(500).json({
        error: "Failed to create pool",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

