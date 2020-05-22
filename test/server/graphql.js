const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    book(title: String!): Book,
    books: [Book]
  }

  type Mutation {
    borrow: Book
  }
`;

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const resolvers = {
  Query: {
    book: () => books[0],
    books: () => books,
  },
  Mutation: {
    borrow: () => books[0]
  }
};

module.exports = exports = new ApolloServer({typeDefs, resolvers});
