import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser'; // For parsing the GraphQL requests
import { Express } from 'express';
import { buildSchema } from 'type-graphql'; // Import TypeGraphQL's buildSchema
import { UserResolver } from './resolvers/resolvers'; // Import the resolvers
import { UserQueryResolver } from './resolvers/user/userQueryResolver';
import 'reflect-metadata'; // Import reflect-metadata for decorators
import { UserCustomRequest } from '../types/customRequest';

// Define the MyContext interface
export interface MyContext {
  req: UserCustomRequest; // Custom request with user object
}

// This function initializes Apollo Server and attaches it to the Express app
export async function initializeApolloServer(app: Express) {
  // Build the schema using TypeGraphQL
  const schema = await buildSchema({
    resolvers: [UserResolver, UserQueryResolver], // Add your resolvers here
    validate: false, // Optional: disable automatic validation
  });

  // Initialize Apollo Server with the TypeGraphQL schema
  const apolloServer = new ApolloServer<MyContext>({
    schema, // Use the schema built from TypeGraphQL
  });

  // Start Apollo Server
  await apolloServer.start();

  // Attach Apollo Server middleware to the `/graphql` endpoint
  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }: { req: UserCustomRequest }) => ({ req }), // Pass request to context
    })
  );

  console.log('Apollo Server is running at /graphql');
}
