// src/app.js
import express from "express";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import bodyParser from "body-parser";
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

// Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers: authResolver,
});

// Start Apollo Server and attach it to Express
const { url } = await startStandaloneServer(server, {
  context,
  listen: { port: 4000 },
});

logger.info(`✅ Apollo Server ready at ${url}`);

// Initialize Express app
const app = express();

// 🛡 Security & Middleware
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(rateLimiter);
app.use(requestLogger);

// Health endpoint
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

// Global error handler
app.use(errorHandler);

logger.info("✅ Apollo Server v4 + Express 5 configured");

export default app;
