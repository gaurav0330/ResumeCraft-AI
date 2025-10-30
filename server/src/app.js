// src/app.js
import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { readFileSync } from "fs";

import { createContext } from './graphql/context.js';
import resolvers from "./graphql/resolvers/index.js";   // ✅ merge all resolvers
import typeDefsArray from "./graphql/schema/index.js";   // ✅ merge all schemas

import { errorHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { logger } from "./config/logger.js";
import { graphqlUploadExpress } from "graphql-upload-minimal";




const __dirname = path.resolve();

// 🏗️ Initialize Express app and HTTP server
const app = express();
const httpServer = http.createServer(app);

// 🧠 Create Apollo Server instance
const server = new ApolloServer({
  typeDefs: typeDefsArray,   // ✅ array of .graphql files (auth, resume, jobDescription)
  resolvers,                 // ✅ combined resolvers
  context: createContext,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// 🚀 Start Apollo Server
await server.start();

// 🛡 Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(rateLimiter);
app.use(requestLogger);
app.use(express.json());
app.use(graphqlUploadExpress({ maxFileSize: 5_000_000, maxFiles: 2 })); // ✅ Added

// 🔌 Mount Apollo GraphQL middleware
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: createContext,
  }),
);


// ❤️ Health check endpoint
app.get("/healthz", (req, res) => res.json({ status: "ok" }));
app.get("/xyz", (req, res) => res.json({ status: "ready" }));

// ❗ Global error handler
app.use(errorHandler);

logger.info("✅ Apollo Server v5 + Express 5 configured and running");

export { app, httpServer };
