const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book!]!
  }

  type Book {
    _id: ID!
    title: String!
    authors: [String!]!
    description: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type RemoveBookResponse {
    message: String!
  }

  type Query {
    user(id: ID, username: String): User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    saveBook(title: String!, authors: [String!]!, description: String!): Book
    removeBook(bookId: ID!): RemoveBookResponse
  }
`;

module.exports = typeDefs;
