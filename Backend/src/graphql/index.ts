import { ApolloServer } from "@apollo/server"
import { User } from "./user"
import { GraphQLScalarType, Kind } from "graphql"

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime() // Convert outgoing Date to integer for JSON
    }
    throw Error("GraphQL Date Scalar serializer expected a `Date` object")
  },
  parseValue(value) {
    if (typeof value === "number") {
      return new Date(value) // Convert incoming integer to Date
    }
    throw new Error("GraphQL Date Scalar parser expected a `number`")
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10))
    }
    // Invalid hard-coded value (not an integer)
    return null
  },
})

async function createGraphqlServer() {
  const gqlServer = new ApolloServer({
    typeDefs: `
            scalar Date
            ${User.typeDefs}
            type Query {
                hello : String
                ${User.queries}
            }
            type Mutation {
                ${User.mutations}
            }
        `,
    resolvers: {
      Date: dateScalar,
      Query: {
        hello : () => "Hello",
        ...User.resolvers.queries,
      },
      Mutation: {
        ...User.resolvers.mutations,
      },
    },
  })

  await gqlServer.start()
  return gqlServer
}

export default createGraphqlServer
