import { Config } from "./models/config";

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  base_url: "/api/v1",
};

export { config };
