import { buildApp } from "@app/server/app";
import { env } from "@shared/infrastructure/config/environment";

async function start(): Promise<void> {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   Server Ready                                        ║
║                                                       ║
║   Environment: ${env.NODE_ENV.padEnd(20)}${" ".repeat(17 - env.NODE_ENV.length)}             ║
║   Port: ${String(env.PORT).padEnd(27)}${" ".repeat(7 - String(env.PORT).length)}                ║
║   Health: http://localhost:${env.PORT}/health${" ".repeat(16)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

start();
