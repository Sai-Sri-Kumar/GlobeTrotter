import { serve } from "bun";
import index from "./index.html";
import { authRoutes } from "./api/routes/user.routes";
import sql from "../src/api/db/connect";

async function startServer() {
  try {
    await sql`select 1`;
    console.log("✅ Database connected");

    const server = serve({
      port: 8080,

      routes: {
        "/*": index,
        ...authRoutes,
      },

      development: process.env.NODE_ENV !== "production" && {
        hmr: true,
        console: true,
      },
    });

    console.log(`🚀 Server running at ${server.url}`);
  } catch (err) {
    console.error("❌ Failed to start server (DB not ready)");
    console.error(err);
    process.exit(1);
  }
}

startServer();
