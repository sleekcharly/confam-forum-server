import { IResolvers } from "apollo-server-express";
import { QueryArrayResult, QueryOneResult } from "../repo/QueryArrayResult";
import { Thread } from "../repo/Thread";
import { updateThreadPoint } from "../repo/ThreadPointRepo";
import {
  createThread,
  getThreadById,
  getThreadsByCategoryId,
} from "../repo/ThreadRepo";
import { GqlContext } from "./GqlContext";

interface EntityResult {
  messages: Array<string> | string;
}

// implement declaration merging for user id and loadedCount
declare module "express-session" {
  export interface SessionData {
    userid: any;
  }
}

const resolvers: IResolvers = {
  ThreadResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }

      return "Thread";
    },
  },

  ThreadArrayResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "ThreadArray";
    },
  },

  Query: {
    getThreadById: async (
      obj: any,
      args: { id: string },
      ctx: GqlContext,
      info: any
    ): Promise<Thread | EntityResult> => {
      let thread: QueryOneResult<Thread>;
      try {
        thread = await getThreadById(args.id);
        if (thread.entity) {
          return thread.entity;
        }
        return {
          messages: thread.messages ? thread.messages[0] : ["test"],
        };
      } catch (ex) {
        throw ex;
      }
    },

    // query for getting threads by category
    getThreadsByCategoryId: async (
      obj: any,
      args: { categoryId: string },
      ctx: GqlContext,
      info: any
    ): Promise<{ threads: Array<Thread> } | EntityResult> => {
      let threads: QueryArrayResult<Thread>;
      try {
        threads = await getThreadsByCategoryId(args.categoryId);
        if (threads.entities) {
          return {
            threads: threads.entities,
          };
        }

        return {
          messages: threads.messages
            ? threads.messages
            : ["An error has occured"],
        };
      } catch (ex) {
        throw ex;
      }
    },
  },

  //   Create mutation for resolvers
  Mutation: {
    createThread: async (
      obj: any,
      args: { userId: string; categoryId: string; title: string; body: string },
      ctx: GqlContext,
      info: any
    ): Promise<EntityResult> => {
      let result: QueryOneResult<Thread>;
      try {
        result = await createThread(
          args.userId,
          args.categoryId,
          args.title,
          args.body
        );

        return {
          messages: result.messages
            ? result.messages
            : ["An error has occured"],
        };
      } catch (ex) {
        throw ex;
      }
    },

    updateThreadPoint: async (
      obj: any,
      args: { threadId: string; increment: boolean },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let result;
      try {
        console.log(ctx.req.session);
        if (!ctx.req.session || !ctx.req.session?.userid) {
          return "You must be logged in to set likes.";
        }
        result = await updateThreadPoint(
          ctx.req.session!.userid,
          args.threadId,
          args.increment
        );

        return result;
      } catch (ex) {
        throw ex;
      }
    },
  },
};

export default resolvers;
