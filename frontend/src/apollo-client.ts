import { ApolloClient, InMemoryCache } from '@apollo/client';

export const apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // adjust the URL to match your backend
  cache: new InMemoryCache(),
  credentials: 'include' // if you need to handle cookies for authentication
});
