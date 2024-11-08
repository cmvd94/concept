import { userQueryResolver } from "./user/userQueryResolver";
import { userMutationResolver } from "./user/userMutationResolver";

export const resolvers = {
  Query: {
    ...userQueryResolver.Query,  // Spread the Query resolvers
  },
  Region: {
    ...userQueryResolver.Region,  // Include Region resolvers
  },
  RegionGrade: {
    ...userQueryResolver.RegionGrade,  // Include RegionGrade resolvers
  },
  Mutation: {
     ...userMutationResolver.Mutation,
   
   }, 
}; 