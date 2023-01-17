import express, { Express } from "express";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from "./config";
import { router } from "./routes";

// Create Express server
const app:Express = express();

// Express configuration
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use(config.base_url, router);

// Start Express server
app.listen(config.port, () => {
  console.log(`  App is running at http://localhost:${config.port} in ${app.get("env")} mode`);
  console.log("  Press CTRL-C to stop\n");
});

export default app;