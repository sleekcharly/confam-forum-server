import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import { createConnection } from "typeorm";
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

console.log(process.env.NODE_ENV);

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

  // set up route
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

  // initialize the server
  app.listen({ port: process.env.SERVER_PORT }, () => {
    console.log(`Server ready on port ${process.env.SERVER_PORT}`);
  });
};

main();
