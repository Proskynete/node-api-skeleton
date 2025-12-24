import { env } from "./@infrastructure/config/environment";
import { buildApp } from "./@infrastructure/http/app";

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
║   🚀 Fastify Server Ready                              ║
║                                                       ║
║   📍 Environment: ${env.NODE_ENV.padEnd(20)} ║
║   🌐 Port: ${String(env.PORT).padEnd(27)} ║
║   📊 Health: http://localhost:${env.PORT}/health${" ".repeat(14)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

start();
