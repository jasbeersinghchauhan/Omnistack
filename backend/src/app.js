import express from "express";
import bodyParser from "body-parser";

import logger from "./shared/middlewares/logger.middleware.js";
import healthRoutes from "./modules/health/health.routes.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger);

app.use("/api/v1/health", healthRoutes);

export default app;