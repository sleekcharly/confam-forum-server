import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import { createConnection } from "typeorm";
import bodyParser from "body-parser";
import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import typeDefs from "./gql/typeDefs";
import resolvers from "./gql/resolvers";
import cors from "cors";
import { loadEnv } from "./common/envLoader";
loadEnv();

// implement declaration merging for user id and loadedCount
declare module "express-session" {
  export interface SessionData {
    userid: any;
    loadedCount: number;
  }
}

// wrap the code in an async function because createConnection is an async call and requires an await prefix.
const main = async () => {
  // instantiate our app with express
  const app = express();

  // set up cors
  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_URL,
    })
  );

  // initialize router object
  const router = express.Router();

  await createConnection();

  // redis object as client to the Redis server
  const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  });

  // create the RedisStore class and redisStore object
  const RedisStore = connectRedis(session);
  const redisStore = new RedisStore({
    client: redis,
  });

  // set up bodyParser to read json parameters from posts
  app.use(bodyParser.json());

  // setup session middleware
  app.use(
    session({
      store: redisStore,
      name: process.env.COOKIE_NAME,
      sameSite: "Strict",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    } as any)
  );
  // use the router middleware
  app.use(router);

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
  });
  apolloServer.applyMiddleware({ app, cors: false });

  // initialize the server
  app.listen({ port: process.env.SERVER_PORT }, () => {
    console.log(
      `Server ready at http://localhost:${process.env.SERVER_PORT}${apolloServer.graphqlPath}`
    );
  });
};

main();
