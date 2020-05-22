import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';

const client = new ApolloClient({
  link: new HttpLink({
    uri: `/graphql`
  }),
  cache: new InMemoryCache()
});

window.getBook = () => {
  return client.query({
    query: gql`
      query Book($title: String!) {
        book(title: $title) {
          title
          author
        }
      }
    `,
    variables: {
      title: 'Harry Potter and the Chamber of Secrets'
    }
  });
};



window.getBooks = () => {
  return client.query({
    query: gql`
      query Books {
        books {
          title
          author
        }
      }
    `,
    variables: {
      unused: 'not relevant'
    }
  });
};

window.getBooksWithoutOperationname = () => {
  return client.query({
    query: gql`
      query{
        books {
          title
          author
        }
      }
    `,
    variables: {
      unused: 'not relevant'
    }
  });
};

window.borrowBook = () => {
  return client.mutate({
    mutation: gql`
    mutation Borrow{
      borrow {
        title
        author
      }
    }
    `,
    variables: {
      bookId: 42
    }
  });
};

window.borrowBookWithoutOperationName = () => {
  return client.mutate({
    mutation: gql`
    mutation {
      borrow {
        title
        author
      }
    }
    `,
    variables: {
      bookId: 42
    }
  });
};
