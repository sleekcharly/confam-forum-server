import { gql } from "apollo-server-express";

const typeDefs = gql`
  # custom scalar type, Date
  scalar Date

  # EntityResult type to used when errors or messages are returned instead of entities
  type EntityResult {
    messages: [String!]
  }

  # User type
  type User {
    id: ID!
    email: String!
    userName: String!
    password: String!
    confirmed: Boolean!
    isDisabled: Boolean!
    threads: [Thread!]
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  # Thread type
  type Thread {
    id: ID!
    views: Int!
    isDisabled: Boolean!
    title: String!
    body: String!
    user: User!
    threadItems: [ThreadItem!]
    category: ThreadCategory
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  # union type
  union ThreadResult = Thread | EntityResult

  # Thread item type
  type ThreadItem {
    id: ID!
    views: Int!
    isDisabled: Boolean!
    body: String!
    user: User!
    thread: Thread!
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  # ThreadCategory type
  type ThreadCategory {
    id: ID!
    name: String!
    description: String
    threads: [Thread!]!
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  # ThreadPoint type
  type ThreadPoint {
    id: ID!
    isDecrement: Boolean!
    user: User!
    thread: Thread!
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  # query with getThreadById function
  type Query {
    getThreadById(id: ID): ThreadResult
    getThreadsByCategoryId(categoryId: ID!): ThreadArrayResult!
  }

  # add mutation
  type Mutation {
    createThread(
      userId: ID!
      categoryId: ID!
      title: String!
      body: String!
    ): EntityResult
  }

  # create a type for returning a threads array
  type ThreadArray {
    threads: [Thread!]
  }

  # create a union type to accomodate return of arrays or an entity
  union ThreadArrayResult = ThreadArray | EntityResult
`;

export default typeDefs;
