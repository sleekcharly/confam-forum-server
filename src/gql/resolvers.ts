import { IResolvers } from "apollo-server-express";
import { QueryArrayResult, QueryOneResult } from "../repo/QueryArrayResult";
import { Thread } from "../repo/Thread";
import { ThreadCategory } from "../repo/ThreadCategory";
import { getAllCategories } from "../repo/ThreadCategoryRepo";
// import { ThreadItem } from "../repo/ThreadItem";
import { updateThreadItemPoint } from "../repo/ThreadItemPointRepo";
import { updateThreadPoint } from "../repo/ThreadPointRepo";
import {
  createThread,
  getThreadById,
  getThreadsByCategoryId,
} from "../repo/ThreadRepo";
import { User } from "../repo/User";
import { login, logout, me, register, UserResult } from "../repo/UserRepo";
import { GqlContext } from "./GqlContext";

const STANDARD_ERROR = "An error has occurred";
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
  UserResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "User";
    },
  },

  ThreadResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }

      return "Thread";
    },
  },

  ThreadItemResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "ThreadItem";
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

  ThreadItemArrayResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "ThreadItemArray";
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

    // query for getting a thread item by its thread id
    // getThreadItemByThreadId: async (
    //     obj: any,
    //     args: {threadId: string},
    //     ctx: GqlContext,
    //     info: any
    // ): Promise<{threadItems: Array<ThreadItem> } | EntityResult> => {
    //     let threadItems: QueryArrayResult<ThreadItem>;
    //     try {
    //         threadItems = await getThreadItemByThreadId(args.threadId);
    //         if (threadItems.entities) {
    //             return {
    //                 threadItems: threadItems.entities,
    //             }
    //         }

    //         return {
    //             messages: threadItems.messages ? threadItems.messages : [STANDARD_ERROR]
    //         }
    //     } catch (ex) {
    //         throw ex
    //     }
    // },

    // query for getting all categories
    getAllCategories: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<Array<ThreadCategory> | EntityResult> => {
      let categories: QueryArrayResult<ThreadCategory>;
      try {
        categories = await getAllCategories();
        if (categories.entities) {
          return categories.entities;
        }
        return {
          messages: categories.messages
            ? categories.messages
            : [STANDARD_ERROR],
        };
      } catch (ex) {
        throw ex;
      }
    },

    // query for me
    me: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<User | EntityResult> => {
      let user: UserResult;
      try {
        if (!ctx.req.session?.userid) {
          return {
            messages: ["User not logged in."],
          };
        }
        user = await me(ctx.req.session.userid);
        if (user && user.user) {
          return user.user;
        }
        return {
          messages: user.messages ? user.messages : [STANDARD_ERROR],
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

    // update thread item point mutation
    updateThreadItemPoint: async (
      obj: any,
      args: { threadItemId: string; increment: boolean },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let result = "";
      try {
        if (!ctx.req.session || !ctx.req.session?.userid) {
          return "You must be logged in to set likes.";
        }
        result = await updateThreadItemPoint(
          ctx.req.session!.userid,
          args.threadItemId,
          args.increment
        );
        return result;
      } catch (ex) {
        throw ex;
      }
    },

    // register call mutation
    register: async (
      obj: any,
      args: { email: string; userName: string; password: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let user: UserResult;
      try {
        user = await register(args.email, args.userName, args.password);
        if (user && user.user) {
          return "Registration successful.";
        }
        return user && user.messages ? user.messages[0] : STANDARD_ERROR;
      } catch (ex) {
        throw ex;
      }
    },

    // login call mutation
    login: async (
      obj: any,
      args: { userName: string; password: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let user: UserResult;
      try {
        user = await login(args.userName, args.password);
        if (user && user.user) {
          ctx.req.session!.userid = user.user.id;

          return `Login successful for userId ${ctx.req.session!.userid}.`;
        }

        return user && user.messages ? user.messages[0] : STANDARD_ERROR;
      } catch (ex) {
        console.log(ex.message);
        throw ex;
      }
    },

    //logout call mutation
    logout: async (
      obj: any,
      args: { userName: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      try {
        let result = await logout(args.userName);
        ctx.req.session?.destroy((err: any) => {
          if (err) {
            console.log("destroy session failed");
            return;
          }
          console.log("session destroyed", ctx.req.session?.userid);
        });
        return result;
      } catch (ex) {
        throw ex;
      }
    },
  },
};

export default resolvers;
