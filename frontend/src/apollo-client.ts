import { ApolloClient, InMemoryCache } from "@apollo/client/core";

export const apolloClient = new ApolloClient({
  uri: import.meta.env.VITE_BACKEND_URL, // adjust the URL to match your backend
  cache: new InMemoryCache(),
  credentials: "include", // if you need to handle cookies for authentication
});
