import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { PostgresRouteRepository } from "./PostgresRouteRepository";
import { RouteController } from "../adapters/inbound/http/RouteController";

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PG_HOST ?? "localhost",
      port: parseInt(process.env.PG_PORT ?? "5432", 10),
      database: process.env.PG_DATABASE ?? "postgres",
      user: process.env.PG_USER ?? "postgres",
      password: process.env.PG_PASSWORD ?? "postgres",
    });

const routeRepository = new PostgresRouteRepository(pool);
const routeController = new RouteController(routeRepository);

const app = express();
app.use(cors());
app.use(express.json());
app.use(routeController.getRouter());

pool
  .query("select 1 as ok")
  .then(() => console.log("Postgres connection OK"))
  .catch((err) => console.error("Postgres connection FAILED", err));

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
