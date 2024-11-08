import { gql } from "graphql-tag";

import { userSchema } from "./userSchema";

export const typeDefs = gql`
  ${userSchema}
`;
