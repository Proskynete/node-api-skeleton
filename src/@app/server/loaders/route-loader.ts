import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { FastifyInstance } from "fastify";

/**
 * Automatic Route Loader
 * Scans @contexts folder and auto-registers all routes from each context
 * Supports multiple API versions (v1, v2, etc.)
 */

interface RouteModule {
  [key: string]: (fastify: FastifyInstance) => Promise<void>;
}

/**
 * Load routes for a specific version from a context
 */
async function loadContextVersionRoutes(
  app: FastifyInstance,
  contextPath: string,
  contextName: string,
  version: string
): Promise<void> {
  const httpPath = join(contextPath, "infrastructure", "http", version);

  if (!existsSync(httpPath)) {
    return;
  }

  const routesPath = join(httpPath, "routes");
  if (!existsSync(routesPath)) {
    return;
  }

  const routeFiles = readdirSync(routesPath).filter(
    (file) => file.endsWith(".routes.ts") || file.endsWith(".routes.js")
  );

  for (const file of routeFiles) {
    const routeFilePath = join(routesPath, file);
    const routeModule = (await import(routeFilePath)) as RouteModule;

    // Look for the exported route function (usually named like greetingRoutes)
    const routeHandler = Object.values(routeModule).find(
      (exp) => typeof exp === "function"
    );

    if (routeHandler) {
      const prefix = `/api/${version}`;
      await app.register(routeHandler, { prefix });

      console.log(
        `✓ Registered ${contextName}/${version} routes at ${prefix}`
      );
    }
  }
}

/**
 * Load all routes from all contexts
 * Scans @contexts/ folder and registers routes for all versions
 */
export async function loadRoutes(app: FastifyInstance): Promise<void> {
  const contextsPath = join(__dirname, "../../../@contexts");

  if (!existsSync(contextsPath)) {
    console.warn("⚠️  @contexts folder not found, skipping route loading");
    return;
  }

  const contexts = readdirSync(contextsPath).filter((item) => {
    const itemPath = join(contextsPath, item);
    return statSync(itemPath).isDirectory();
  });

  console.log(`\n📦 Loading routes from ${contexts.length} context(s)...`);

  for (const contextName of contexts) {
    const contextPath = join(contextsPath, contextName);
    const httpBasePath = join(contextPath, "infrastructure", "http");

    if (!existsSync(httpBasePath)) {
      continue;
    }

    // Scan for version folders (v1, v2, etc.)
    const versions = readdirSync(httpBasePath).filter((item) => {
      const versionPath = join(httpBasePath, item);
      return statSync(versionPath).isDirectory() && item.startsWith("v");
    });

    for (const version of versions) {
      await loadContextVersionRoutes(app, contextPath, contextName, version);
    }
  }

  console.log("✓ Route loading completed\n");
}
