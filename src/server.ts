import app from "./app";
import { config } from "./config";

// Start Express server
const server = app.listen(config.port, () => {
  console.log(
    `  App is running at http://localhost:${config.port} in ${app.get(
      "env"
    )} mode`
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;
