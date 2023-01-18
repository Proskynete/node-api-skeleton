import "dotenv/config";

import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config";
import { router } from "./routes";
import Health from "./tools/health";

// Create Express server
const app: Express = express();

// Express configuration
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.use("/health", Health);

// routes
app.use(config.base_url, router);

export default app;
