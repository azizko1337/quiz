import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";

import { initDatabase } from "./database/init";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { getAuthUser } from "./middleware/auth";

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startServer() {
  // Initialize the database
  await initDatabase();
  await server.start();

  app.use(
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        // Get the auth token from the headers
        const token = req.headers.authorization?.split(" ")[1] || "";

        // Get authenticated user (or null if not authenticated)
        const authUser = await getAuthUser(token);

        return {
          req,
          res,
          authUser,
        };
      },
    })
  );

  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, () => resolve())
  );
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
}
startServer();
