import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import { createConnection } from "typeorm";
import { login, logout, register } from "./repo/UserRepo";
import bodyParser from "body-parser";
import {
  createThread,
  getThreadById,
  getThreadsByCategoryId,
} from "./repo/ThreadRepo";
import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import typeDefs from "./gql/typeDefs";
import resolvers from "./gql/resolvers";
// Here, we import our dotenv package and set up default configurations. This is
// what allows our .env file to be used in our project.
require("dotenv").config();

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
      sameSite: "strict",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    } as any)
  );
  // use the router middleware
  app.use(router);

  // set up route for logining in a user
  router.post("/login", async (req, res, next) => {
    try {
      console.log("params", req.body);
      const userResult = await login(req.body.userName, req.body.password);

      if (userResult && userResult.user) {
        req.session!.userid = userResult.user?.id;
        res.send(`user logged in, userId: ${req.session!.userid}`);
      } else if (userResult && userResult.messages) {
        res.send(userResult.messages[0]);
      } else {
        next();
      }
    } catch (ex) {
      res.send(ex.message);
    }
  });

  // set up route for logging out a user
  router.post("/logout", async (req, res, next) => {
    try {
      console.log("params", req.body);
      const msg = await logout(req.body.userName);
      if (msg) {
        req.session!.userid = null;
        res.send(msg);
      } else {
        next();
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  //set up route for registering a new user
  router.post("/register", async (req, res, next) => {
    try {
      console.log("params", req.body);
      const userResult = await register(
        req.body.email,
        req.body.userName,
        req.body.password
      );

      if (userResult && userResult.user) {
        res.send(`new user created, userId: ${userResult.user.id}`);
      } else if (userResult && userResult.messages) {
        res.send(userResult.messages[0]);
      } else {
        next();
      }
    } catch (ex) {
      res.send(ex.message);
    }
  });

  // set up route getting home route data
  router.get("/", (req, res, next) => {
    if (!req.session!.userid) {
      req.session!.userid = req.query.userid;
      console.log("Userid is set");
      req.session!.loadedCount = 0;
    } else {
      req.session!.loadedCount = Number(req.session!.loadedCount) + 1;
    }

    // response to request by sending seddion information
    res.send(
      `userid: ${req.session!.userid}, loadedCount: ${req.session!.loadedCount}`
    );
  });

  // route for creating a thread
  router.post("/createthread", async (req, res, next) => {
    try {
      console.log("userId", req.session);
      console.log("body", req.body);
      const msg = await createThread(
        req.session!.userid,
        req.body.categoryId,
        req.body.title,
        req.body.body
      );
      res.send(msg);
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  // route for getting threads by a particular category
  router.post("/threadsbycategory", async (req, res, next) => {
    try {
      const threadResult = await getThreadsByCategoryId(req.body.categoryId);

      if (threadResult && threadResult.entities) {
        let items = "";
        threadResult.entities.forEach((th) => {
          items += th.title + ", ";
        });

        res.send(items);
      } else if (threadResult && threadResult.messages) {
        res.send(threadResult.messages[0]);
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  // route for getting a particular thread
  router.post("/thread", async (req, res, next) => {
    try {
      const threadResult = await getThreadById(req.body.id);

      if (threadResult && threadResult.entity) {
        res.send(threadResult.entity.title);
      } else if (threadResult && threadResult.messages) {
        res.send(threadResult.messages[0]);
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
  });
  apolloServer.applyMiddleware({ app });

  // initialize the server
  app.listen({ port: process.env.SERVER_PORT }, () => {
    console.log(`Server ready on port ${process.env.SERVER_PORT}`);
  });
};

main();
