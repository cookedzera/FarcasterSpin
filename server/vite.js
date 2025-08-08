import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const log = (message) => {
  console.log(`${new Date().toLocaleTimeString()} [express] ${message}`);
};

export async function setupVite(app, server) {
  try {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, "../client"),
      plugins: [],
    });
    
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
    
    log("Vite dev server setup complete");
  } catch (e) {
    console.error("Error setting up Vite:", e);
  }
}

export function serveStatic(app) {
  const staticPath = path.join(__dirname, "../client/dist");
  app.use(express.static(staticPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
  
  log("Static file serving enabled");
}