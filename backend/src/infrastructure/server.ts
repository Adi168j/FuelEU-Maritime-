import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { PostgresRouteRepository } from "./PostgresRouteRepository";
import { PostgresComplianceRepository } from "./PostgresComplianceRepository";
import { RouteController } from "../adapters/inbound/http/RouteController";
import { ComplianceController } from "../adapters/inbound/http/ComplianceController";
import { CalculateCBUseCase } from "../core/application/CalculateCBUseCase";

console.log("Environment loaded - PG_HOST:", process.env.PG_HOST);
console.log("Environment loaded - PG_USER:", process.env.PG_USER);
console.log("Environment loaded - PG_PASSWORD:", JSON.stringify(process.env.PG_PASSWORD));
console.log("Environment loaded - PG_PORT:", process.env.PG_PORT);
console.log("Environment loaded - PG_DATABASE:", process.env.PG_DATABASE);

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PG_HOST ?? "localhost",
      port: parseInt(process.env.PG_PORT ?? "5432", 10),
      database: process.env.PG_DATABASE ?? "postgres",
      user: process.env.PG_USER ?? "postgres",
      password: process.env.PG_PASSWORD ?? "postgres",
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

const config = process.env.DATABASE_URL
  ? `CONNECTION_STRING: ${process.env.DATABASE_URL}`
  : `HOST: ${process.env.PG_HOST}, USER: ${process.env.PG_USER}, DB: ${process.env.PG_DATABASE}`;
console.log("Pool config:", config);

console.log("Pool created");

const routeRepository = new PostgresRouteRepository(pool);
console.log("RouteRepository created");

const complianceRepository = new PostgresComplianceRepository(pool);
console.log("ComplianceRepository created");

const routeController = new RouteController(routeRepository);
console.log("RouteController created");

const calculateCBUseCase = new CalculateCBUseCase();
const complianceController = new ComplianceController(
  complianceRepository,
  calculateCBUseCase
);
console.log("ComplianceController created");

const app = express();
console.log("Express app created");

app.use(cors());
app.use(express.json());
app.use(routeController.getRouter());
app.use(complianceController.getRouter());

pool
  .query("select 1 as ok")
  .then(() => console.log("Postgres connection OK"))
  .catch((err) => {
    console.error("Postgres connection FAILED", err);
    process.exit(1);
  });

console.log("About to listen...");

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

console.log("Server setup complete");

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
