import express from "express";
import bodyParser from "body-parser";

import logger from "./shared/middlewares/logger.middleware.js";
import healthRoutes from "./modules/health/health.routes.js";
import productsRoutes from "./modules/products/product.routes.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/products", productsRoutes);

export default app;