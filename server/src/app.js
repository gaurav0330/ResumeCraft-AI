// src/app.js
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";

import cors from "cors";
import helmet from "helmet";
import { readFileSync } from "fs";
import path from "path";

import context from "./graphql/context.js";
import authResolver from "./graphql/resolvers/auth.resolver.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { logger } from "./config/logger.js";

const __dirname = path.resolve();

// Load schema
const typeDefs = readFileSync(
  path.join(__dirname, "src/graphql/schema/auth.graphql"),
  "utf8",
);

// Initialize Express app
const app = express();
const httpServer = http.createServer(app);

// Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers: authResolver,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start Apollo Server
await server.start();

// 🛡 Security & Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(rateLimiter);
app.use(requestLogger);

// Apply Apollo GraphQL middleware
app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context,
  })
);

// Health endpoint
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

// Global error handler
app.use(errorHandler);

logger.info("✅ Apollo Server v5 + Express 5 configured");

export { app, httpServer };
