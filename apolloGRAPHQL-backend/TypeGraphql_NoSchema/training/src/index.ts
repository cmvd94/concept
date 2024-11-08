import "reflect-metadata"

import { ApolloServer } from "apollo-server-express";
import * as Express from "express";
import { buildSchema, Query, Resolver} from "type-graphql";

@Resolver()
class HelloResolver {
  @Query( () => String, {name: 'vishnu'} )
  async hello() {
    return "hello World"
  }
}

const main = async () => {
    const schema = await buildSchema({
        resolvers: [HelloResolver]
    })

    const apolloserver = new ApolloServer( {schema})
    await apolloserver.start()

    const app = Express()

    apolloserver.applyMiddleware({app});
    app.listen(4000, () => {
        console.log(" server started on PORT:4000")
    })

}

main()
