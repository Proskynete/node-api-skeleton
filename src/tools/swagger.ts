import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node API Skeleton",
      description: "Node API Skeleton",
      version,
    },
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app: Express): void => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (_: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.json(swaggerSpec);
  });
};

export { swaggerDocs };
