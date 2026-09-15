import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Serves directory-index HTML for /demos/<slug>/ requests. TanStack Start's dev
// middleware routes every extension-less path through the React router (so a
// request to /demos/amor-nails-spa/ 404s before Vite's public/ dir can serve
// the folder's index.html). This plugin runs first and short-circuits directory
// requests under /demos/ with the static index.html from public/. It does NOT
// touch the React homepage ("/") or any other route.
function serveDemosDirectoryIndex(): Plugin {
  return {
    name: "zynthos-serve-demos-directory-index",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          if (req.method !== "GET" && req.method !== "HEAD") return next();
          const url = new URL(req.url ?? "/", "http://localhost");
          const pathname = decodeURIComponent(url.pathname);
          if (!pathname.startsWith("/demos/") || !pathname.endsWith("/")) {
            return next();
          }
          const filePath = path.join(server.config.publicDir, pathname, "index.html");
          if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            return next();
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          if (req.method === "HEAD") {
            res.end();
          } else {
            res.end(fs.readFileSync(filePath));
          }
          return;
        } catch {
          return next();
        }
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    // The site is reverse-proxied behind <label>.<PUBLIC_SITE_DOMAIN>; the proxy
    // masks the Host to localhost:3000, but accept any host so a dev server never
    // rejects a proxied request with "Blocked request".
    allowedHosts: true,
    // The dev server is reachable through the TLS proxy, so the HMR websocket
    // must dial back on 443, not the dev port. If the socket can't connect,
    // pages still serve — hot reload degrades, never breaks.
    hmr: { clientPort: 443 },
    // The dev server can serve source files; never let it serve local secrets,
    // and never let it serve anything outside the site dir. Gotchas this list
    // encodes: a custom `deny` REPLACES Vite's defaults (so .git must be
    // restated), patterns containing "/" match the ABSOLUTE path (so dir
    // patterns need a leading **/), and `allow` left to its default widens to
    // the nearest workspace root — a stray .git or workspaces package.json in
    // /home/team/shared would expose the whole shared dir.
    fs: {
      strict: true,
      allow: [import.meta.dirname],
      deny: [".env", ".env.*", "*.{crt,pem,key}", "**/.run/**", "**/.git/**"],
    },
  },
  plugins: [
    serveDemosDirectoryIndex(),
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    viteReact(),
  ],
});
