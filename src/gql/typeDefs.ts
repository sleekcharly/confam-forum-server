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

  # query with getThreadById function
  type Query {
    getThreadById(id: ID): ThreadResult
  }
`;

export default typeDefs;
