import express from "express";
import { Pool } from "pg";
import { PostgresRouteRepository } from "./PostgresRouteRepository";
import { RouteController } from "../adapters/inbound/http/RouteController";

const pool = new Pool({
  host: process.env.PG_HOST ?? "localhost",
  port: parseInt(process.env.PG_PORT ?? "5432", 10),
  database: process.env.PG_DATABASE ?? "postgres",
  user: process.env.PG_USER ?? "postgres",
  password: process.env.PG_PASSWORD ?? "postgres",
});

const routeRepository = new PostgresRouteRepository(pool);
const routeController = new RouteController(routeRepository);

const app = express();
app.use(express.json());
app.use(routeController.getRouter());

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
