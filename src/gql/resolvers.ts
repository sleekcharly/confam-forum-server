import { IResolvers } from "apollo-server-express";
import { QueryOneResult } from "../repo/QueryArrayResult";
import { Thread } from "../repo/Thread";
import { getThreadById } from "../repo/ThreadRepo";
import { GqlContext } from "./GqlContext";

interface EntityResult {
  messages: Array<string> | string;
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
  },
};

export default resolvers;
